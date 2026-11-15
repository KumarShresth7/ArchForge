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
        name = "problem_notes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "problem_slug"})
)
public class ProblemNote {

    @Id
    @Column(nullable = false)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "problem_slug", nullable = false)
    private String problemSlug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content = "";

    @Convert(converter = InstantStringConverter.class)
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public ProblemNote() {
    }

    public ProblemNote(String id, String userId, String problemSlug, String content, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.problemSlug = problemSlug;
        this.content = content != null ? content : "";
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
