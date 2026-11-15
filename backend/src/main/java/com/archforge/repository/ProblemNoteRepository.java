package com.archforge.repository;

import com.archforge.model.ProblemNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemNoteRepository extends JpaRepository<ProblemNote, String> {
    Optional<ProblemNote> findByUserIdAndProblemSlug(String userId, String problemSlug);
}
