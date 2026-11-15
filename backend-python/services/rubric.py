"""Rule-based architecture rubric evaluation."""

from dataclasses import dataclass, field


@dataclass
class RubricResult:
    score: int
    feedback: list[str] = field(default_factory=list)
    must_have_met: list[str] = field(default_factory=list)
    must_have_missing: list[str] = field(default_factory=list)
    should_have_met: list[str] = field(default_factory=list)
    should_have_missing: list[str] = field(default_factory=list)
    reference_match_pct: int = 0


COMPONENT_LABELS: dict[str, str] = {
    "web_client": "Web Client",
    "mobile_client": "Mobile App",
    "load_balancer": "Load Balancer",
    "api_gateway": "API Gateway",
    "cdn": "CDN",
    "app_server": "App Server",
    "microservice": "Microservice",
    "serverless": "Serverless",
    "sql_database": "SQL Database",
    "nosql_database": "NoSQL Database",
    "blob_storage": "Blob Storage",
    "search_index": "Search Index",
    "redis": "Redis Cache",
    "memcached": "Memcached",
    "message_queue": "Message Queue",
    "pub_sub": "Pub/Sub",
    "rate_limiter": "Rate Limiter",
    "auth_service": "Auth Service",
    "analytics": "Analytics",
}


def _label(component_type: str) -> str:
    return COMPONENT_LABELS.get(component_type, component_type.replace("_", " ").title())


def extract_component_types(graph: dict) -> set[str]:
    types: set[str] = set()
    for node in graph.get("nodes", []):
        ct = node.get("component_type")
        if ct and ct not in ("input", "default", "output"):
            types.add(ct)
            continue
        label = (node.get("label") or "").lower()
        for key, keywords in [
            ("load_balancer", ["load balanc"]),
            ("redis", ["redis", "cache"]),
            ("sql_database", ["sql", "postgres", "mysql"]),
            ("nosql_database", ["nosql", "mongo", "dynamodb"]),
            ("cdn", ["cdn"]),
            ("message_queue", ["queue", "kafka", "sqs"]),
            ("blob_storage", ["blob", "s3", "storage"]),
            ("api_gateway", ["gateway", "api gateway"]),
            ("rate_limiter", ["rate limit"]),
        ]:
            if any(kw in label for kw in keywords):
                types.add(key)
    return types


def evaluate_rubric(graph: dict, rubric: dict) -> RubricResult:
    present = extract_component_types(graph)
    must_have = rubric.get("must_have", [])
    should_have = rubric.get("should_have", [])
    reference = rubric.get("reference_solution") or {}

    must_met = [c for c in must_have if c in present]
    must_missing = [c for c in must_have if c not in present]
    should_met = [c for c in should_have if c in present]
    should_missing = [c for c in should_have if c not in present]

    feedback: list[str] = []

    # Must-have: 50 points
    must_score = 0
    if must_have:
        must_score = round(50 * len(must_met) / len(must_have))
        for c in must_missing:
            feedback.append(f"Missing required component: {_label(c)}")
        for c in must_met:
            feedback.append(f"✓ Required component present: {_label(c)}")

    # Should-have: 25 points
    should_score = 0
    if should_have:
        should_score = round(25 * len(should_met) / len(should_have))
        for c in should_missing:
            feedback.append(f"Recommended but missing: {_label(c)}")

    # Reference solution overlap: 25 points
    ref_types = set(reference.get("component_types", []))
    ref_score = 0
    ref_match_pct = 0
    if ref_types:
        overlap = present & ref_types
        ref_match_pct = round(100 * len(overlap) / len(ref_types))
        ref_score = round(25 * len(overlap) / len(ref_types))
        missing_ref = ref_types - present
        if missing_ref:
            labels = ", ".join(_label(c) for c in sorted(missing_ref))
            feedback.append(f"Reference design also includes: {labels}")

    # Minimum component count bonus/penalty
    node_count = len(graph.get("nodes", []))
    if node_count < 2:
        feedback.append("Design is too minimal — add more components")
    elif node_count >= 5 and must_score >= 40:
        feedback.append("Good component depth for a high-level design")

    total = min(100, must_score + should_score + ref_score)

    return RubricResult(
        score=total,
        feedback=feedback,
        must_have_met=must_met,
        must_have_missing=must_missing,
        should_have_met=should_met,
        should_have_missing=should_missing,
        reference_match_pct=ref_match_pct,
    )


def combine_scores(rubric_score: int, ai_score: int) -> int:
    """40% rubric (deterministic) + 60% AI (reasoning)."""
    return round(0.4 * rubric_score + 0.6 * ai_score)
