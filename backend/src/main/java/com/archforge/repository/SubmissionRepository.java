package com.archforge.repository;

import com.archforge.model.Submission;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {

    List<Submission> findByUserIdOrderBySubmittedAtDesc(String userId, Pageable pageable);

    List<Submission> findByUserIdAndProblemSlugOrderBySubmittedAtDesc(String userId, String problemSlug, Pageable pageable);

    Optional<Submission> findByIdAndUserId(String id, String userId);

    long countByUserId(String userId);

    List<Submission> findByUserId(String userId);
}
