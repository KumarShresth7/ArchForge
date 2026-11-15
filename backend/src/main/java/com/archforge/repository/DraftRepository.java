package com.archforge.repository;

import com.archforge.model.Draft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DraftRepository extends JpaRepository<Draft, String> {
    Optional<Draft> findByUserIdAndProblemSlug(String userId, String problemSlug);
    void deleteByUserIdAndProblemSlug(String userId, String problemSlug);
}
