package com.archforge.controller;

import com.archforge.dto.*;
import com.archforge.model.Submission;
import com.archforge.model.User;
import com.archforge.model.UserProblemProgress;
import com.archforge.repository.SubmissionRepository;
import com.archforge.repository.UserProblemProgressRepository;
import com.archforge.service.PersonalizationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UserProblemProgressRepository progressRepository;
    private final SubmissionRepository submissionRepository;
    private final PersonalizationService personalizationService;

    public DashboardController(
            UserProblemProgressRepository progressRepository,
            SubmissionRepository submissionRepository,
            PersonalizationService personalizationService
    ) {
        this.progressRepository = progressRepository;
        this.submissionRepository = submissionRepository;
        this.personalizationService = personalizationService;
    }

    @GetMapping
    public DashboardResponseDto getDashboard(@AuthenticationPrincipal User user) {
        List<UserProblemProgress> progressRows = progressRepository.findByUserIdOrderByLastAttemptAtDescNullsLast(user.getId());
        List<Submission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(user.getId(), PageRequest.of(0, 5));
        long totalSubmissions = submissionRepository.countByUserId(user.getId());

        int solved = (int) progressRows.stream().filter(p -> "solved".equalsIgnoreCase(p.getStatus())).count();
        int attempted = (int) progressRows.stream()
                .filter(p -> "attempted".equalsIgnoreCase(p.getStatus()) || "solved".equalsIgnoreCase(p.getStatus()))
                .count();

        List<Double> scores = progressRows.stream()
                .filter(p -> p.getBestScore() != null)
                .map(UserProblemProgress::getBestScore)
                .toList();

        Double avg = null;
        if (!scores.isEmpty()) {
            double mean = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            avg = Math.round(mean * 10.0) / 10.0;
        }

        Map<String, Integer> skillProfile = personalizationService.computeSkillProfile(user.getId());
        List<RecommendedProblemDto> recommended = personalizationService.recommendProblems(user.getId(), 4);

        DashboardStatsDto stats = new DashboardStatsDto(
                attempted,
                solved,
                totalSubmissions,
                avg,
                user.getCurrentStreak(),
                user.getLongestStreak()
        );

        List<ProgressResponseDto> progressDtos = progressRows.stream()
                .map(ProgressResponseDto::fromEntity)
                .toList();

        List<SubmissionResponseDto> submissionDtos = submissions.stream()
                .map(SubmissionResponseDto::fromEntity)
                .toList();

        List<SkillProfileEntryDto> skillDtos = skillProfile.entrySet().stream()
                .map(e -> new SkillProfileEntryDto(e.getKey(), e.getValue()))
                .toList();

        return new DashboardResponseDto(
                UserResponseDto.fromEntity(user),
                stats,
                progressDtos,
                submissionDtos,
                recommended,
                skillDtos
        );
    }
}
