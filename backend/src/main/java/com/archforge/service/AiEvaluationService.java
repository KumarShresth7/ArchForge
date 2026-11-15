package com.archforge.service;

import com.archforge.model.Problem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class AiEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(AiEvaluationService.class);

    public record AiEvaluationResult(int score, List<String> bottlenecks, List<String> suggestions) {}

    private final String apiKey;
    private final String model;
    private final String apiUrl;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public AiEvaluationService(
            @Value("${archforge.groq.api-key:}") String apiKey,
            @Value("${archforge.groq.model:llama-3.3-70b-versatile}") String model,
            @Value("${archforge.groq.url:https://api.groq.com/openai/v1/chat/completions}") String apiUrl,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public AiEvaluationResult evaluateArchitecture(
            Problem problem,
            Map<String, Object> graph,
            RubricEvaluationService.RubricResult rubricResult
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            log.info("No GROQ_API_KEY provided; using deterministic AI qualitative evaluation fallback.");
            return generateFallback(problem, rubricResult);
        }

        try {
            String systemPrompt = String.format(
                    "You are an expert Principal Cloud Architect. Evaluate the submitted high-level system design against the problem requirements. " +
                    "Be specific about missing components, scalability issues, and single points of failure. " +
                    "The rule-based rubric already scored %d/100 — focus on qualitative analysis the rubric cannot capture. " +
                    "You must output ONLY valid JSON matching this schema: " +
                    "{\"score\": <int 0-100>, \"bottlenecks\": [\"string\", ...], \"suggestions\": [\"string\", ...]}",
                    rubricResult.score()
            );

            StringBuilder userPrompt = new StringBuilder();
            userPrompt.append("Problem: ").append(problem.getTitle()).append("\n\n");
            userPrompt.append("Description: ").append(problem.getDescription()).append("\n\n");

            userPrompt.append("Functional requirements:\n");
            for (String r : problem.getFunctionalRequirements()) {
                userPrompt.append("- ").append(r).append("\n");
            }
            userPrompt.append("\nNon-functional requirements:\n");
            for (String r : problem.getNonFunctionalRequirements()) {
                userPrompt.append("- ").append(r).append("\n");
            }
            userPrompt.append("\nRubric feedback:\n");
            for (String f : rubricResult.feedback()) {
                userPrompt.append("- ").append(f).append("\n");
            }
            userPrompt.append("\nSubmitted architecture graph:\n");
            userPrompt.append(objectMapper.writeValueAsString(graph)).append("\n\n");
            userPrompt.append("Score 0-100 for qualitative architecture quality and provide bottlenecks and suggestions.");

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "temperature", 0.1,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt.toString())
                    )
            );

            String responseString = restClient.post()
                    .uri(apiUrl)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseString);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            JsonNode parsed = objectMapper.readTree(content);
            int score = parsed.path("score").asInt(rubricResult.score());
            List<String> bottlenecks = objectMapper.convertValue(parsed.path("bottlenecks"), new TypeReference<>() {});
            List<String> suggestions = objectMapper.convertValue(parsed.path("suggestions"), new TypeReference<>() {});

            return new AiEvaluationResult(
                    Math.max(0, Math.min(100, score)),
                    bottlenecks != null ? bottlenecks : Collections.emptyList(),
                    suggestions != null ? suggestions : Collections.emptyList()
            );

        } catch (Exception e) {
            log.warn("Groq AI evaluation failed ({}), falling back to deterministic qualitative analysis: {}", e.getClass().getSimpleName(), e.getMessage());
            return generateFallback(problem, rubricResult);
        }
    }

    private AiEvaluationResult generateFallback(Problem problem, RubricEvaluationService.RubricResult rubricResult) {
        int baseScore = rubricResult.score();
        List<String> bottlenecks = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        if (!rubricResult.mustHaveMissing().isEmpty()) {
            for (String missing : rubricResult.mustHaveMissing()) {
                bottlenecks.add(String.format("Critical architecture gap: absence of %s will cause functional failure or severe throughput degradation.", missing.replace("_", " ")));
                suggestions.add(String.format("Integrate a dedicated %s component into the request processing lifecycle.", missing.replace("_", " ")));
            }
        }

        if (!rubricResult.shouldHaveMissing().isEmpty()) {
            for (String missing : rubricResult.shouldHaveMissing()) {
                bottlenecks.add(String.format("Potential scalability limitation: lacking %s to handle high concurrent load efficiently.", missing.replace("_", " ")));
                suggestions.add(String.format("Provision %s to buffer traffic and optimize resource utilization.", missing.replace("_", " ")));
            }
        }

        if (bottlenecks.isEmpty()) {
            bottlenecks.add("Ensure horizontal auto-scaling and health checks are configured for all stateless application services.");
            bottlenecks.add("Monitor database connection pool exhaustion and read replica replication lag under peak traffic.");
            suggestions.add("Add cross-region disaster recovery and automated failover policies for persistent stores.");
            suggestions.add("Implement circuit breakers and exponential backoff retry patterns across inter-service communication.");
        }

        return new AiEvaluationResult(baseScore, bottlenecks, suggestions);
    }
}
