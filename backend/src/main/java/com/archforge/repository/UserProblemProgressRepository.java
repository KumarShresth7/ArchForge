package com.archforge.repository;

import com.archforge.model.UserProblemProgress;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProblemProgressRepository extends JpaRepository<UserProblemProgress, String> {

    Optional<UserProblemProgress> findByUserIdAndProblemSlug(String userId, String problemSlug);

    List<UserProblemProgress> findByUserId(String userId);

    @Query("SELECT p FROM UserProblemProgress p WHERE p.userId = :userId ORDER BY CASE WHEN p.lastAttemptAt IS NULL THEN 1 ELSE 0 END, p.lastAttemptAt DESC")
    List<UserProblemProgress> findByUserIdOrderByLastAttemptAtDescNullsLast(@Param("userId") String userId);

    interface LeaderboardRow {
        String getName();
        String getProblemSlug();
        Double getBestScore();
        String getStatus();
    }

    @Query("SELECT u.name AS name, p.problemSlug AS problemSlug, p.bestScore AS bestScore, p.status AS status " +
           "FROM UserProblemProgress p, User u " +
           "WHERE u.id = p.userId AND p.bestScore IS NOT NULL " +
           "AND (:problemSlug IS NULL OR p.problemSlug = :problemSlug) " +
           "ORDER BY p.bestScore DESC")
    List<LeaderboardRow> findLeaderboard(@Param("problemSlug") String problemSlug, Pageable pageable);
}
