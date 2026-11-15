package com.archforge.controller;

import com.archforge.dto.ProblemContextDto;
import com.archforge.dto.ProblemDetailDto;
import com.archforge.dto.ProblemSummaryDto;
import com.archforge.model.Problem;
import com.archforge.model.User;
import com.archforge.model.UserProblemProgress;
import com.archforge.repository.ProblemRepository;
import com.archforge.repository.UserProblemProgressRepository;
import com.archforge.service.PersonalizationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemRepository problemRepository;
    private final UserProblemProgressRepository progressRepository;
    private final PersonalizationService personalizationService;

    public ProblemController(
            ProblemRepository problemRepository,
            UserProblemProgressRepository progressRepository,
            PersonalizationService personalizationService
    ) {
        this.problemRepository = problemRepository;
        this.progressRepository = progressRepository;
        this.personalizationService = personalizationService;
    }

    @GetMapping
    public List<ProblemSummaryDto> listProblems() {
        return problemRepository.findAllByOrderByDifficultyAscTitleAsc().stream()
                .map(ProblemSummaryDto::fromEntity)
                .toList();
    }

    @GetMapping("/{slug}/context")
    public ProblemContextDto getProblemContext(
            @PathVariable("slug") String slug,
            @AuthenticationPrincipal User user
    ) {
        Problem problem = problemRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));

        UserProblemProgress progress = null;
        if (user != null) {
            progress = progressRepository.findByUserIdAndProblemSlug(user.getId(), slug).orElse(null);
        }

        return new ProblemContextDto(
                slug,
                personalizationService.hintsAreUnlocked(progress),
                progress != null ? progress.getAttemptCount() : 0,
                progress != null ? progress.getBestScore() : null,
                progress != null ? progress.getStatus() : "not_started",
                personalizationService.similarProblems(slug, 3)
        );
    }

    @GetMapping("/{slug}")
    public ProblemDetailDto getProblem(@PathVariable("slug") String slug) {
        Problem problem = problemRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));
        return ProblemDetailDto.fromEntity(problem);
    }
}
