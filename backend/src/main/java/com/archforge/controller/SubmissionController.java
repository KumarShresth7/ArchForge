package com.archforge.controller;

import com.archforge.dto.SubmissionDetailResponseDto;
import com.archforge.dto.SubmissionResponseDto;
import com.archforge.model.Submission;
import com.archforge.model.User;
import com.archforge.repository.SubmissionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;

    public SubmissionController(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    @GetMapping
    public List<SubmissionResponseDto> listSubmissions(
            @RequestParam(name = "problem_slug", required = false) String problemSlug,
            @RequestParam(name = "limit", defaultValue = "20") int limit,
            @AuthenticationPrincipal User user
    ) {
        int cappedLimit = Math.min(Math.max(1, limit), 50);
        List<Submission> submissions;
        if (problemSlug != null && !problemSlug.isBlank()) {
            submissions = submissionRepository.findByUserIdAndProblemSlugOrderBySubmittedAtDesc(
                    user.getId(), problemSlug, PageRequest.of(0, cappedLimit)
            );
        } else {
            submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(
                    user.getId(), PageRequest.of(0, cappedLimit)
            );
        }

        return submissions.stream()
                .map(SubmissionResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/{submission_id}")
    public SubmissionDetailResponseDto getSubmission(
            @PathVariable("submission_id") String submissionId,
            @AuthenticationPrincipal User user
    ) {
        Submission submission = submissionRepository.findByIdAndUserId(submissionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));
        return SubmissionDetailResponseDto.fromEntity(submission);
    }
}
