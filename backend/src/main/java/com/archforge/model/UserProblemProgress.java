package com.archforge.model;

import com.archforge.converter.InstantStringConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "user_problem_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "problem_slug"})
)
public class UserProblemProgress {

    @Id
    @Column(nullable = false)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "problem_slug", nullable = false)
    private String problemSlug;

    @Column(nullable = false)
    private String status = "not_started";

    @Column(name = "best_score")
    private Double bestScore;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Convert(converter = InstantStringConverter.class)
    @Column(name = "last_attempt_at")
    private Instant lastAttemptAt;

    @Column(name = "hints_unlocked")
    private Boolean hintsUnlocked = false;

    public UserProblemProgress() {
    }

    public UserProblemProgress(String id, String userId, String problemSlug, String status, Double bestScore, Integer attemptCount, Instant lastAttemptAt, Boolean hintsUnlocked) {
        this.id = id;
        this.userId = userId;
        this.problemSlug = problemSlug;
        this.status = status != null ? status : "not_started";
        this.bestScore = bestScore;
        this.attemptCount = attemptCount != null ? attemptCount : 0;
        this.lastAttemptAt = lastAttemptAt;
        this.hintsUnlocked = hintsUnlocked != null ? hintsUnlocked : false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProblemSlug() {
        return problemSlug;
    }

    public void setProblemSlug(String problemSlug) {
        this.problemSlug = problemSlug;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getBestScore() {
        return bestScore;
    }

    public void setBestScore(Double bestScore) {
        this.bestScore = bestScore;
    }

    public Integer getAttemptCount() {
        return attemptCount != null ? attemptCount : 0;
    }

    public void setAttemptCount(Integer attemptCount) {
        this.attemptCount = attemptCount;
    }

    public Instant getLastAttemptAt() {
        return lastAttemptAt;
    }

    public void setLastAttemptAt(Instant lastAttemptAt) {
        this.lastAttemptAt = lastAttemptAt;
    }

    public Boolean getHintsUnlocked() {
        return hintsUnlocked != null && hintsUnlocked;
    }

    public void setHintsUnlocked(Boolean hintsUnlocked) {
        this.hintsUnlocked = hintsUnlocked;
    }
}
