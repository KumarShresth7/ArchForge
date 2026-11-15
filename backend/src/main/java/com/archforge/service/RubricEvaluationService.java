package com.archforge.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RubricEvaluationService {

    public record RubricResult(
            int score,
            List<String> feedback,
            List<String> mustHaveMet,
            List<String> mustHaveMissing,
            List<String> shouldHaveMet,
            List<String> shouldHaveMissing,
            int referenceMatchPct
    ) {}

    private static final Map<String, String> COMPONENT_LABELS = Map.ofEntries(
            Map.entry("web_client", "Web Client"),
            Map.entry("mobile_client", "Mobile App"),
            Map.entry("load_balancer", "Load Balancer"),
            Map.entry("api_gateway", "API Gateway"),
            Map.entry("cdn", "CDN"),
            Map.entry("app_server", "App Server"),
            Map.entry("microservice", "Microservice"),
            Map.entry("serverless", "Serverless"),
            Map.entry("sql_database", "SQL Database"),
            Map.entry("nosql_database", "NoSQL Database"),
            Map.entry("blob_storage", "Blob Storage"),
            Map.entry("search_index", "Search Index"),
            Map.entry("redis", "Redis Cache"),
            Map.entry("memcached", "Memcached"),
            Map.entry("message_queue", "Message Queue"),
            Map.entry("pub_sub", "Pub/Sub"),
            Map.entry("rate_limiter", "Rate Limiter"),
            Map.entry("auth_service", "Auth Service"),
            Map.entry("analytics", "Analytics")
    );

    public String getLabel(String componentType) {
        if (COMPONENT_LABELS.containsKey(componentType)) {
            return COMPONENT_LABELS.get(componentType);
        }
        return componentType.replace("_", " ").substring(0, 1).toUpperCase() +
                componentType.replace("_", " ").substring(1);
    }

    @SuppressWarnings("unchecked")
    public Set<String> extractComponentTypes(Map<String, Object> graph) {
        Set<String> types = new HashSet<>();
        if (graph == null) return types;

        List<Map<String, Object>> nodes = (List<Map<String, Object>>) graph.get("nodes");
        if (nodes == null) return types;

        for (Map<String, Object> node : nodes) {
            String ct = (String) node.get("component_type");
            if (ct != null && !ct.equals("input") && !ct.equals("default") && !ct.equals("output")) {
                types.add(ct);
                continue;
            }

            String label = (node.get("label") != null ? node.get("label").toString() : "").toLowerCase();
            matchKeyword(label, types, "load_balancer", List.of("load balanc"));
            matchKeyword(label, types, "redis", List.of("redis", "cache"));
            matchKeyword(label, types, "sql_database", List.of("sql", "postgres", "mysql"));
            matchKeyword(label, types, "nosql_database", List.of("nosql", "mongo", "dynamodb"));
            matchKeyword(label, types, "cdn", List.of("cdn"));
            matchKeyword(label, types, "message_queue", List.of("queue", "kafka", "sqs"));
            matchKeyword(label, types, "blob_storage", List.of("blob", "s3", "storage"));
            matchKeyword(label, types, "api_gateway", List.of("gateway", "api gateway"));
            matchKeyword(label, types, "rate_limiter", List.of("rate limit"));
        }
        return types;
    }

    private void matchKeyword(String label, Set<String> types, String key, List<String> keywords) {
        for (String kw : keywords) {
            if (label.contains(kw)) {
                types.add(key);
                break;
            }
        }
    }

    @SuppressWarnings("unchecked")
    public RubricResult evaluateRubric(Map<String, Object> graph, Map<String, Object> rubric) {
        Set<String> present = extractComponentTypes(graph);
        List<String> mustHave = rubric != null && rubric.get("must_have") instanceof List
                ? (List<String>) rubric.get("must_have")
                : Collections.emptyList();
        List<String> shouldHave = rubric != null && rubric.get("should_have") instanceof List
                ? (List<String>) rubric.get("should_have")
                : Collections.emptyList();
        Map<String, Object> reference = rubric != null && rubric.get("reference_solution") instanceof Map
                ? (Map<String, Object>) rubric.get("reference_solution")
                : Collections.emptyMap();

        List<String> mustMet = new ArrayList<>();
        List<String> mustMissing = new ArrayList<>();
        for (String c : mustHave) {
            if (present.contains(c)) mustMet.add(c);
            else mustMissing.add(c);
        }

        List<String> shouldMet = new ArrayList<>();
        List<String> shouldMissing = new ArrayList<>();
        for (String c : shouldHave) {
            if (present.contains(c)) shouldMet.add(c);
            else shouldMissing.add(c);
        }

        List<String> feedback = new ArrayList<>();

        // Must-have: 50 points
        int mustScore = 0;
        if (!mustHave.isEmpty()) {
            mustScore = (int) Math.round(50.0 * mustMet.size() / mustHave.size());
            for (String c : mustMissing) {
                feedback.add("Missing required component: " + getLabel(c));
            }
            for (String c : mustMet) {
                feedback.add("✓ Required component present: " + getLabel(c));
            }
        }

        // Should-have: 25 points
        int shouldScore = 0;
        if (!shouldHave.isEmpty()) {
            shouldScore = (int) Math.round(25.0 * shouldMet.size() / shouldHave.size());
            for (String c : shouldMissing) {
                feedback.add("Recommended but missing: " + getLabel(c));
            }
        }

        // Reference solution overlap: 25 points
        List<String> refTypesList = reference != null && reference.get("component_types") instanceof List
                ? (List<String>) reference.get("component_types")
                : Collections.emptyList();
        Set<String> refTypes = new HashSet<>(refTypesList);

        int refScore = 0;
        int refMatchPct = 0;
        if (!refTypes.isEmpty()) {
            Set<String> overlap = new HashSet<>(present);
            overlap.retainAll(refTypes);
            refMatchPct = (int) Math.round(100.0 * overlap.size() / refTypes.size());
            refScore = (int) Math.round(25.0 * overlap.size() / refTypes.size());

            Set<String> missingRef = new TreeSet<>(refTypes);
            missingRef.removeAll(present);
            if (!missingRef.isEmpty()) {
                String labels = missingRef.stream().map(this::getLabel).reduce((a, b) -> a + ", " + b).orElse("");
                feedback.add("Reference design also includes: " + labels);
            }
        }

        // Component depth feedback
        int nodeCount = 0;
        if (graph != null && graph.get("nodes") instanceof List) {
            nodeCount = ((List<?>) graph.get("nodes")).size();
        }
        if (nodeCount < 2) {
            feedback.add("Design is too minimal — add more components");
        } else if (nodeCount >= 5 && mustScore >= 40) {
            feedback.add("Good component depth for a high-level design");
        }

        int total = Math.min(100, mustScore + shouldScore + refScore);

        return new RubricResult(
                total,
                feedback,
                mustMet,
                mustMissing,
                shouldMet,
                shouldMissing,
                refMatchPct
        );
    }

    public int combineScores(int rubricScore, int aiScore) {
        return (int) Math.round(0.4 * rubricScore + 0.6 * aiScore);
    }
}
