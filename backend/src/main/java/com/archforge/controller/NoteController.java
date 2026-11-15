package com.archforge.controller;

import com.archforge.dto.NoteResponseDto;
import com.archforge.dto.NoteUpsertRequestDto;
import com.archforge.model.ProblemNote;
import com.archforge.model.User;
import com.archforge.repository.ProblemNoteRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final ProblemNoteRepository noteRepository;

    public NoteController(ProblemNoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @GetMapping("/{problem_slug}")
    public NoteResponseDto getNote(
            @PathVariable("problem_slug") String problemSlug,
            @AuthenticationPrincipal User user
    ) {
        return noteRepository.findByUserIdAndProblemSlug(user.getId(), problemSlug)
                .map(note -> new NoteResponseDto(note.getProblemSlug(), note.getContent(), note.getUpdatedAt()))
                .orElseGet(() -> new NoteResponseDto(problemSlug, "", null));
    }

    @PutMapping("/{problem_slug}")
    @Transactional
    public NoteResponseDto upsertNote(
            @PathVariable("problem_slug") String problemSlug,
            @RequestBody NoteUpsertRequestDto body,
            @AuthenticationPrincipal User user
    ) {
        Optional<ProblemNote> existing = noteRepository.findByUserIdAndProblemSlug(user.getId(), problemSlug);
        Instant now = Instant.now();
        ProblemNote note;
        if (existing.isPresent()) {
            note = existing.get();
            note.setContent(body.content());
            note.setUpdatedAt(now);
        } else {
            note = new ProblemNote(
                    UUID.randomUUID().toString(),
                    user.getId(),
                    problemSlug,
                    body.content(),
                    now
            );
        }
        note = noteRepository.save(note);
        return new NoteResponseDto(note.getProblemSlug(), note.getContent(), note.getUpdatedAt());
    }
}
