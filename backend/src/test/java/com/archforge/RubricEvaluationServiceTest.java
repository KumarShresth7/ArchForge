package com.archforge;

import com.archforge.service.RubricEvaluationService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RubricEvaluationServiceTest {

    private final RubricEvaluationService service = new RubricEvaluationService();

    @Test
    void testExtractComponentTypes() {
        Map<String, Object> graph = Map.of(
                "nodes", List.of(
                        Map.of("id", "1", "component_type", "load_balancer"),
                        Map.of("id", "2", "label", "My Redis Cache"),
                        Map.of("id", "3", "label", "Postgres SQL Database")
                )
        );

        Set<String> types = service.extractComponentTypes(graph);
        assertTrue(types.contains("load_balancer"));
        assertTrue(types.contains("redis"));
        assertTrue(types.contains("sql_database"));
    }

    @Test
    void testEvaluateRubric() {
        Map<String, Object> graph = Map.of(
                "nodes", List.of(
                        Map.of("id", "1", "component_type", "web_client"),
                        Map.of("id", "2", "component_type", "load_balancer"),
                        Map.of("id", "3", "component_type", "app_server"),
                        Map.of("id", "4", "component_type", "sql_database"),
                        Map.of("id", "5", "component_type", "redis")
                )
        );

        Map<String, Object> rubric = Map.of(
                "must_have", List.of("web_client", "load_balancer", "app_server", "sql_database"),
                "should_have", List.of("redis", "cdn"),
                "reference_solution", Map.of(
                        "component_types", List.of("web_client", "load_balancer", "app_server", "redis", "sql_database")
                )
        );

        RubricEvaluationService.RubricResult result = service.evaluateRubric(graph, rubric);

        // must_have: 4/4 = 50
        // should_have: 1/2 = 13 (25 * 1/2 = 12.5 -> round to 13)
        // reference: 5/5 = 25
        // total: 50 + 13 + 25 = 88
        assertEquals(88, result.score());
        assertEquals(100, result.referenceMatchPct());
        assertEquals(4, result.mustHaveMet().size());
        assertTrue(result.mustHaveMissing().isEmpty());
        assertTrue(result.shouldHaveMet().contains("redis"));
        assertTrue(result.shouldHaveMissing().contains("cdn"));
    }

    @Test
    void testCombineScores() {
        // 40% rubric + 60% AI
        int combined = service.combineScores(80, 90);
        // 0.4 * 80 + 0.6 * 90 = 32 + 54 = 86
        assertEquals(86, combined);
    }
}
