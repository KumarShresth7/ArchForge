package com.archforge.service;

import com.archforge.dto.EvaluationResultDto;
import com.archforge.model.Problem;
import com.archforge.model.Submission;
import com.archforge.model.User;
import com.archforge.model.UserProblemProgress;
import com.archforge.repository.ProblemRepository;
import com.archforge.repository.SubmissionRepository;
import com.archforge.repository.UserProblemProgressRepository;
import com.archforge.repository.UserRepository;
import com.archforge.websocket.WebSocketSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class EvaluationPipelineService {

    private static final Logger log = LoggerFactory.getLogger(EvaluationPipelineService.class);

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final UserProblemProgressRepository progressRepository;
    private final RubricEvaluationService rubricService;
    private final AiEvaluationService aiService;
    private final PersonalizationService personalizationService;
    private final WebSocketSessionManager webSocketSessionManager;

    public EvaluationPipelineService(
            ProblemRepository problemRepository,
            UserRepository userRepository,
            SubmissionRepository submissionRepository,
            UserProblemProgressRepository progressRepository,
            RubricEvaluationService rubricService,
            AiEvaluationService aiService,
            PersonalizationService personalizationService,
            WebSocketSessionManager webSocketSessionManager
    ) {
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.progressRepository = progressRepository;
        this.rubricService = rubricService;
        this.aiService = aiService;
        this.personalizationService = personalizationService;
        this.webSocketSessionManager = webSocketSessionManager;
    }

    @Async
    public void processAndEmitEvaluation(String sessionId, String userId, String problemSlug, Map<String, Object> graph) {
        try {
            Problem problem = problemRepository.findBySlug(problemSlug).orElse(null);
            if (problem == null) {
                webSocketSessionManager.sendJsonPayload(sessionId, EvaluationResultDto.failed("Problem not found"));
                return;
            }

            // Step 1: Rule-based rubric (fast, deterministic)
            Map<String, Object> rubricConfig = new HashMap<>();
            if (problem.getEvaluationRubric() != null) {
                rubricConfig.putAll(problem.getEvaluationRubric());
            }
            if (problem.getReferenceSolution() != null) {
                rubricConfig.put("reference_solution", problem.getReferenceSolution());
            }

            RubricEvaluationService.RubricResult rubricResult = rubricService.evaluateRubric(graph, rubricConfig);

            webSocketSessionManager.sendJsonPayload(
                    sessionId,
                    EvaluationResultDto.processing(
                            String.format("Rubric score: %d/100 — running AI analysis…", rubricResult.score()),
                            rubricResult.score()
                    )
            );

            // Step 2: AI evaluation
            AiEvaluationService.AiEvaluationResult aiResult = aiService.evaluateArchitecture(problem, graph, rubricResult);

            // Step 3: Hybrid score
            int finalScore = rubricService.combineScores(rubricResult.score(), aiResult.score());

            // Step 4: Persist progress if user authenticated
            if (userId != null && !userId.isBlank()) {
                persistSubmissionAndProgress(userId, problemSlug, finalScore, graph, rubricResult, aiResult);
            }

            // Step 5: Send completion payload
            EvaluationResultDto completedPayload = new EvaluationResultDto(
                    "completed",
                    null,
                    finalScore,
                    rubricResult.score(),
                    aiResult.score(),
                    rubricResult.feedback(),
                    rubricResult.mustHaveMet(),
                    rubricResult.mustHaveMissing(),
                    rubricResult.shouldHaveMet(),
                    rubricResult.referenceMatchPct(),
                    aiResult.bottlenecks(),
                    aiResult.suggestions(),
                    problem.getSlug()
            );

            webSocketSessionManager.sendJsonPayload(sessionId, completedPayload);

        } catch (Exception e) {
            log.error("AI Engine evaluation error for session {}: {}", sessionId, e.getMessage(), e);
            webSocketSessionManager.sendJsonPayload(
                    sessionId,
                    EvaluationResultDto.failed("AI Engine evaluation error: " + e.getMessage())
            );
        }
    }

    @Transactional
    public void persistSubmissionAndProgress(
            String userId,
            String problemSlug,
            int finalScore,
            Map<String, Object> graph,
            RubricEvaluationService.RubricResult rubricResult,
            AiEvaluationService.AiEvaluationResult aiResult
    ) {
        Instant now = Instant.now();

        Submission submission = new Submission();
        submission.setId(UUID.randomUUID().toString());
        submission.setUserId(userId);
        submission.setProblemSlug(problemSlug);
        submission.setGraphJson(graph);
        submission.setScore(finalScore);
        submission.setRubricScore(rubricResult.score());
        submission.setAiScore(aiResult.score());
        submission.setRubricFeedback(rubricResult.feedback());
        submission.setBottlenecks(aiResult.bottlenecks());
        submission.setSuggestions(aiResult.suggestions());
        submission.setSubmittedAt(now);
        submissionRepository.save(submission);

        Optional<UserProblemProgress> progressOpt = progressRepository.findByUserIdAndProblemSlug(userId, problemSlug);
        String calculatedStatus = finalScore >= PersonalizationService.SOLVED_THRESHOLD ? "solved" : "attempted";

        if (progressOpt.isPresent()) {
            UserProblemProgress progress = progressOpt.get();
            progress.setAttemptCount(progress.getAttemptCount() + 1);
            progress.setLastAttemptAt(now);
            double currentBest = progress.getBestScore() != null ? progress.getBestScore() : 0.0;
            progress.setBestScore(Math.max(currentBest, finalScore));

            if (progress.getBestScore() >= PersonalizationService.SOLVED_THRESHOLD) {
                progress.setStatus("solved");
            } else if ("not_started".equalsIgnoreCase(progress.getStatus())) {
                progress.setStatus(calculatedStatus);
            }

            if (finalScore < PersonalizationService.SOLVED_THRESHOLD) {
                progress.setHintsUnlocked(true);
            }
            progressRepository.save(progress);
        } else {
            UserProblemProgress newProgress = new UserProblemProgress(
                    UUID.randomUUID().toString(),
                    userId,
                    problemSlug,
                    calculatedStatus,
                    (double) finalScore,
                    1,
                    now,
                    finalScore < PersonalizationService.SOLVED_THRESHOLD
            );
            progressRepository.save(newProgress);
        }

        userRepository.findById(userId).ifPresent(user -> {
            personalizationService.updateUserStreak(user);
            userRepository.save(user);
        });
    }
}
