package com.archforge.controller;

import com.archforge.dto.ProgressResponseDto;
import com.archforge.model.User;
import com.archforge.repository.UserProblemProgressRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final UserProblemProgressRepository progressRepository;

    public ProgressController(UserProblemProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @GetMapping
    public List<ProgressResponseDto> getAllProgress(@AuthenticationPrincipal User user) {
        return progressRepository.findByUserId(user.getId()).stream()
                .map(ProgressResponseDto::fromEntity)
                .toList();
    }
}
