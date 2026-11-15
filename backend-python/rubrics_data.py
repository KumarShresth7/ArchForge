"""Per-problem evaluation rubrics and reference solutions."""

PROBLEM_RUBRICS: dict[str, dict] = {
    "design-url-shortener": {
        "must_have": ["web_client", "load_balancer", "app_server", "sql_database"],
        "should_have": ["redis", "cdn"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["web_client", "load_balancer", "app_server", "redis", "sql_database"],
            "description": "Client → LB → App Server → Redis cache + SQL DB for persistence",
        },
    },
    "design-rate-limiter": {
        "must_have": ["api_gateway", "redis", "app_server"],
        "should_have": ["load_balancer", "rate_limiter"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["api_gateway", "rate_limiter", "redis", "app_server", "load_balancer"],
            "description": "Gateway with rate limiter backed by Redis counters",
        },
    },
    "design-twitter": {
        "must_have": ["mobile_client", "load_balancer", "app_server", "nosql_database", "redis"],
        "should_have": ["message_queue", "cdn", "blob_storage"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "load_balancer", "app_server", "redis", "nosql_database", "message_queue", "cdn"],
            "description": "Fan-out timeline with cache, queue, and media CDN",
        },
    },
    "design-netflix": {
        "must_have": ["mobile_client", "cdn", "app_server", "blob_storage", "nosql_database"],
        "should_have": ["load_balancer", "microservice", "search_index"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "cdn", "load_balancer", "microservice", "blob_storage", "nosql_database"],
            "description": "CDN for video + metadata services + blob storage",
        },
    },
    "design-uber": {
        "must_have": ["mobile_client", "api_gateway", "app_server", "nosql_database"],
        "should_have": ["redis", "message_queue", "load_balancer"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "api_gateway", "app_server", "redis", "nosql_database", "message_queue"],
            "description": "Real-time location with geospatial index and WebSocket updates",
        },
    },
    "design-chat-system": {
        "must_have": ["mobile_client", "app_server", "message_queue", "nosql_database"],
        "should_have": ["redis", "load_balancer", "blob_storage"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "load_balancer", "app_server", "message_queue", "redis", "nosql_database"],
            "description": "WebSocket server + queue for offline delivery + message store",
        },
    },
    "design-web-crawler": {
        "must_have": ["app_server", "message_queue", "blob_storage", "nosql_database"],
        "should_have": ["load_balancer", "sql_database"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["app_server", "message_queue", "nosql_database", "blob_storage"],
            "description": "URL frontier queue + workers + dedup store + content blob storage",
        },
    },
    "design-notification-system": {
        "must_have": ["app_server", "message_queue", "nosql_database"],
        "should_have": ["redis", "microservice", "load_balancer"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["app_server", "message_queue", "microservice", "redis", "nosql_database"],
            "description": "Event bus + per-channel workers + preference store",
        },
    },
    "design-pastebin": {
        "must_have": ["web_client", "app_server", "blob_storage", "sql_database"],
        "should_have": ["load_balancer", "redis", "cdn"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["web_client", "load_balancer", "app_server", "redis", "blob_storage"],
            "description": "Object storage for pastes + cache for hot reads",
        },
    },
    "design-yelp": {
        "must_have": ["mobile_client", "app_server", "nosql_database", "search_index"],
        "should_have": ["load_balancer", "redis", "sql_database"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "load_balancer", "app_server", "search_index", "nosql_database", "redis"],
            "description": "Geospatial search index + business/review storage",
        },
    },
    "design-dropbox": {
        "must_have": ["mobile_client", "app_server", "blob_storage", "sql_database", "message_queue"],
        "should_have": ["load_balancer", "cdn", "redis"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "load_balancer", "app_server", "blob_storage", "sql_database", "message_queue"],
            "description": "Metadata DB + chunk blob storage + sync notification queue",
        },
    },
    "design-instagram": {
        "must_have": ["mobile_client", "load_balancer", "app_server", "blob_storage", "nosql_database", "cdn"],
        "should_have": ["redis", "message_queue", "search_index"],
        "anti_patterns": [],
        "reference_solution": {
            "component_types": ["mobile_client", "cdn", "load_balancer", "app_server", "blob_storage", "nosql_database", "redis"],
            "description": "Media CDN + feed service + blob storage + social graph DB",
        },
    },
}

DEFAULT_RUBRIC = {
    "must_have": ["app_server"],
    "should_have": ["load_balancer"],
    "anti_patterns": [],
    "reference_solution": {
        "component_types": ["web_client", "load_balancer", "app_server"],
        "description": "Basic three-tier architecture",
    },
}


def get_rubric_for_slug(slug: str) -> dict:
    base = PROBLEM_RUBRICS.get(slug, DEFAULT_RUBRIC)
    return {
        "must_have": base.get("must_have", []),
        "should_have": base.get("should_have", []),
        "anti_patterns": base.get("anti_patterns", []),
        "reference_solution": base.get("reference_solution"),
    }
