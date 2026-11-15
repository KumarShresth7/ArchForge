package com.archforge.seed;

import com.archforge.model.Problem;
import com.archforge.repository.ProblemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProblemRepository problemRepository;
    private final ObjectMapper objectMapper;

    public DataInitializer(ProblemRepository problemRepository, ObjectMapper objectMapper) {
        this.problemRepository = problemRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            ClassPathResource resource = new ClassPathResource("seed-problems.json");
            if (!resource.exists()) {
                log.warn("seed-problems.json not found on classpath; skipping seeding");
                return;
            }

            List<Map<String, Object>> seedData;
            try (InputStream is = resource.getInputStream()) {
                seedData = objectMapper.readValue(is, new TypeReference<>() {});
            }

            long currentCount = problemRepository.count();
            if (currentCount == 0) {
                log.info("Seeding {} problems into database...", seedData.size());
                for (Map<String, Object> data : seedData) {
                    Problem problem = mapToProblem(data);
                    problemRepository.save(problem);
                }
                log.info("Database problems seeded successfully.");
                return;
            }

            // Backfill rubrics if missing
            Map<String, Map<String, Object>> seedMap = seedData.stream()
                    .collect(Collectors.toMap(d -> (String) d.get("slug"), d -> d, (a, b) -> a));

            List<Problem> existing = problemRepository.findAll();
            int updated = 0;
            for (Problem p : existing) {
                Map<String, Object> seed = seedMap.get(p.getSlug());
                if (seed != null) {
                    boolean needUpdate = false;
                    if (p.getEvaluationRubric() == null || p.getEvaluationRubric().isEmpty()) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> rubric = (Map<String, Object>) seed.get("evaluation_rubric");
                        p.setEvaluationRubric(rubric);
                        needUpdate = true;
                    }
                    if (p.getReferenceSolution() == null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> ref = (Map<String, Object>) seed.get("reference_solution");
                        if (ref != null) {
                            p.setReferenceSolution(ref);
                            needUpdate = true;
                        }
                    }
                    if (needUpdate) {
                        problemRepository.save(p);
                        updated++;
                    }
                }
            }
            if (updated > 0) {
                log.info("Backfilled rubrics for {} existing problems.", updated);
            }

        } catch (Exception e) {
            log.error("Failed to initialize seed problems: {}", e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private Problem mapToProblem(Map<String, Object> data) {
        Problem p = new Problem();
        p.setId((String) data.get("id"));
        p.setSlug((String) data.get("slug"));
        p.setTitle((String) data.get("title"));
        p.setDifficulty((String) data.get("difficulty"));
        p.setDescription((String) data.get("description"));

        if (data.get("tags") instanceof List) {
            p.setTags((List<String>) data.get("tags"));
        }
        if (data.get("functional_requirements") instanceof List) {
            p.setFunctionalRequirements((List<String>) data.get("functional_requirements"));
        }
        if (data.get("non_functional_requirements") instanceof List) {
            p.setNonFunctionalRequirements((List<String>) data.get("non_functional_requirements"));
        }
        if (data.get("hints") instanceof List) {
            p.setHints((List<String>) data.get("hints"));
        }
        if (data.get("starter_graph") instanceof Map) {
            p.setStarterGraph((Map<String, Object>) data.get("starter_graph"));
        }
        if (data.get("evaluation_rubric") instanceof Map) {
            p.setEvaluationRubric((Map<String, Object>) data.get("evaluation_rubric"));
        }
        if (data.get("reference_solution") instanceof Map) {
            p.setReferenceSolution((Map<String, Object>) data.get("reference_solution"));
        }
        return p;
    }
}
