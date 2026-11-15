package com.archforge.controller;

import com.archforge.dto.DraftResponseDto;
import com.archforge.dto.DraftUpsertRequestDto;
import com.archforge.model.Draft;
import com.archforge.model.User;
import com.archforge.repository.DraftRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/drafts")
public class DraftController {

    private final DraftRepository draftRepository;

    public DraftController(DraftRepository draftRepository) {
        this.draftRepository = draftRepository;
    }

    @GetMapping("/{problem_slug}")
    public DraftResponseDto getDraft(
            @PathVariable("problem_slug") String problemSlug,
            @AuthenticationPrincipal User user
    ) {
        return draftRepository.findByUserIdAndProblemSlug(user.getId(), problemSlug)
                .map(DraftResponseDto::fromEntity)
                .orElse(null);
    }

    @PutMapping("/{problem_slug}")
    @Transactional
    public DraftResponseDto upsertDraft(
            @PathVariable("problem_slug") String problemSlug,
            @RequestBody DraftUpsertRequestDto body,
            @AuthenticationPrincipal User user
    ) {
        Optional<Draft> existing = draftRepository.findByUserIdAndProblemSlug(user.getId(), problemSlug);
        Instant now = Instant.now();
        Draft draft;
        if (existing.isPresent()) {
            draft = existing.get();
            draft.setGraphJson(body.graphJson());
            draft.setUpdatedAt(now);
        } else {
            draft = new Draft(
                    UUID.randomUUID().toString(),
                    user.getId(),
                    problemSlug,
                    body.graphJson(),
                    now
            );
        }
        draft = draftRepository.save(draft);
        return DraftResponseDto.fromEntity(draft);
    }

    @DeleteMapping("/{problem_slug}")
    @Transactional
    public Map<String, String> deleteDraft(
            @PathVariable("problem_slug") String problemSlug,
            @AuthenticationPrincipal User user
    ) {
        draftRepository.deleteByUserIdAndProblemSlug(user.getId(), problemSlug);
        return Map.of("status", "deleted");
    }
}
