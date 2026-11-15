package com.archforge.controller;

import com.archforge.dto.LocalSyncRequestDto;
import com.archforge.dto.TokenResponseDto;
import com.archforge.dto.UserResponseDto;
import com.archforge.dto.UserSyncRequestDto;
import com.archforge.model.Draft;
import com.archforge.model.User;
import com.archforge.model.UserProblemProgress;
import com.archforge.repository.DraftRepository;
import com.archforge.repository.UserProblemProgressRepository;
import com.archforge.repository.UserRepository;
import com.archforge.service.JwtService;
import com.archforge.service.PersonalizationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserProblemProgressRepository progressRepository;
    private final DraftRepository draftRepository;
    private final JwtService jwtService;

    public UserController(
            UserRepository userRepository,
            UserProblemProgressRepository progressRepository,
            DraftRepository draftRepository,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.progressRepository = progressRepository;
        this.draftRepository = draftRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/sync")
    @Transactional
    public TokenResponseDto syncUser(@RequestBody UserSyncRequestDto body) {
        Optional<User> existing = userRepository.findByEmail(body.email());
        User user;
        if (existing.isPresent()) {
            user = existing.get();
            user.setName(body.name());
            user.setImage(body.image());
        } else {
            user = new User(
                    UUID.randomUUID().toString(),
                    body.email(),
                    body.name(),
                    body.image()
            );
        }
        user = userRepository.save(user);

        String token = jwtService.createToken(user.getId(), user.getEmail());
        return new TokenResponseDto(token, UserResponseDto.fromEntity(user));
    }

    @GetMapping("/me")
    public UserResponseDto getMe(@AuthenticationPrincipal User user) {
        return UserResponseDto.fromEntity(user);
    }

    @PostMapping("/me/sync-local")
    @Transactional
    public Map<String, String> syncLocalData(
            @RequestBody LocalSyncRequestDto body,
            @AuthenticationPrincipal User user
    ) {
        if (body.progress() != null) {
            for (Map.Entry<String, Map<String, Object>> entry : body.progress().entrySet()) {
                String slug = entry.getKey();
                Map<String, Object> prog = entry.getValue();

                Optional<UserProblemProgress> existingOpt = progressRepository.findByUserIdAndProblemSlug(user.getId(), slug);
                Double bestScore = null;
                if (prog.get("bestScore") instanceof Number num) {
                    bestScore = num.doubleValue();
                }
                int attemptCount = 0;
                if (prog.get("attemptCount") instanceof Number num) {
                    attemptCount = num.intValue();
                }
                String status = prog.get("status") != null ? prog.get("status").toString() : "attempted";

                if (existingOpt.isPresent()) {
                    UserProblemProgress existing = existingOpt.get();
                    if (bestScore != null) {
                        double current = existing.getBestScore() != null ? existing.getBestScore() : 0.0;
                        existing.setBestScore(Math.max(current, bestScore));
                    }
                    existing.setAttemptCount(Math.max(existing.getAttemptCount(), attemptCount));

                    if ("solved".equalsIgnoreCase(status) || (existing.getBestScore() != null && existing.getBestScore() >= PersonalizationService.SOLVED_THRESHOLD)) {
                        existing.setStatus("solved");
                    } else if ("not_started".equalsIgnoreCase(existing.getStatus())) {
                        existing.setStatus(status);
                    }
                    progressRepository.save(existing);
                } else {
                    Instant lastAttempt = prog.get("lastAttemptAt") != null ? Instant.now() : null;
                    UserProblemProgress newProgress = new UserProblemProgress(
                            UUID.randomUUID().toString(),
                            user.getId(),
                            slug,
                            status,
                            bestScore,
                            attemptCount,
                            lastAttempt,
                            bestScore != null && bestScore < PersonalizationService.SOLVED_THRESHOLD
                    );
                    progressRepository.save(newProgress);
                }
            }
        }

        if (body.drafts() != null) {
            for (Map.Entry<String, Map<String, Object>> entry : body.drafts().entrySet()) {
                String slug = entry.getKey();
                Map<String, Object> draftGraph = entry.getValue();

                Optional<Draft> existingOpt = draftRepository.findByUserIdAndProblemSlug(user.getId(), slug);
                Instant now = Instant.now();
                if (existingOpt.isPresent()) {
                    Draft draft = existingOpt.get();
                    draft.setGraphJson(draftGraph);
                    draft.setUpdatedAt(now);
                    draftRepository.save(draft);
                } else {
                    Draft draft = new Draft(
                            UUID.randomUUID().toString(),
                            user.getId(),
                            slug,
                            draftGraph,
                            now
                    );
                    draftRepository.save(draft);
                }
            }
        }

        return Map.of("status", "synced");
    }
}
