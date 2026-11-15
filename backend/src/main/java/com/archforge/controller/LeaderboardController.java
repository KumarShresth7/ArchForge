package com.archforge.controller;

import com.archforge.dto.LeaderboardEntryDto;
import com.archforge.repository.UserProblemProgressRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final UserProblemProgressRepository progressRepository;

    public LeaderboardController(UserProblemProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @GetMapping
    public List<LeaderboardEntryDto> getLeaderboard(
            @RequestParam(name = "problem_slug", required = false) String problemSlug,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        int cappedLimit = Math.min(Math.max(1, limit), 50);
        String slugParam = (problemSlug != null && !problemSlug.isBlank()) ? problemSlug : null;

        List<UserProblemProgressRepository.LeaderboardRow> rows =
                progressRepository.findLeaderboard(slugParam, PageRequest.of(0, cappedLimit));

        List<LeaderboardEntryDto> result = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            UserProblemProgressRepository.LeaderboardRow row = rows.get(i);
            result.add(new LeaderboardEntryDto(
                    i + 1,
                    row.getName(),
                    row.getProblemSlug(),
                    row.getBestScore(),
                    row.getStatus()
            ));
        }

        return result;
    }
}
