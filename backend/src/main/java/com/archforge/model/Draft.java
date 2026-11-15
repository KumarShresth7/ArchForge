package com.archforge.model;

import com.archforge.converter.InstantStringConverter;
import com.archforge.converter.JsonMapConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(
        name = "drafts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "problem_slug"})
)
public class Draft {

    @Id
    @Column(nullable = false)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "problem_slug", nullable = false)
    private String problemSlug;

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "graph_json", nullable = false, columnDefinition = "TEXT")
    private Map<String, Object> graphJson = new HashMap<>();

    @Convert(converter = InstantStringConverter.class)
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Draft() {
    }

    public Draft(String id, String userId, String problemSlug, Map<String, Object> graphJson, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.problemSlug = problemSlug;
        this.graphJson = graphJson != null ? graphJson : new HashMap<>();
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

    public Map<String, Object> getGraphJson() {
        return graphJson;
    }

    public void setGraphJson(Map<String, Object> graphJson) {
        this.graphJson = graphJson;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
