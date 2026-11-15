package com.archforge.controller;

import com.archforge.dto.EvaluationRequestDto;
import com.archforge.model.Problem;
import com.archforge.model.User;
import com.archforge.repository.ProblemRepository;
import com.archforge.service.EvaluationPipelineService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/evaluate")
public class EvaluationController {

    private final ProblemRepository problemRepository;
    private final EvaluationPipelineService evaluationPipelineService;

    public EvaluationController(
            ProblemRepository problemRepository,
            EvaluationPipelineService evaluationPipelineService
    ) {
        this.problemRepository = problemRepository;
        this.evaluationPipelineService = evaluationPipelineService;
    }

    @PostMapping
    public Map<String, String> evaluateArchitecture(
            @RequestBody EvaluationRequestDto request,
            @AuthenticationPrincipal User user
    ) {
        Problem problem = problemRepository.findBySlug(request.problemSlug())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));

        evaluationPipelineService.processAndEmitEvaluation(
                request.sessionId(),
                user != null ? user.getId() : null,
                problem.getSlug(),
                request.graph()
        );

        return Map.of("status", "queued", "problem_slug", problem.getSlug());
    }
}
