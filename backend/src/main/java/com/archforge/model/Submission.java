package com.archforge.model;

import com.archforge.converter.InstantStringConverter;
import com.archforge.converter.JsonListConverter;
import com.archforge.converter.JsonMapConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "submissions")
public class Submission {

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

    @Column(nullable = false)
    private Integer score;

    @Column(name = "rubric_score")
    private Integer rubricScore;

    @Column(name = "ai_score")
    private Integer aiScore;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "rubric_feedback", columnDefinition = "TEXT")
    private List<String> rubricFeedback = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private List<String> bottlenecks = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private List<String> suggestions = new ArrayList<>();

    @Convert(converter = InstantStringConverter.class)
    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();

    public Submission() {
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

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRubricScore() {
        return rubricScore;
    }

    public void setRubricScore(Integer rubricScore) {
        this.rubricScore = rubricScore;
    }

    public Integer getAiScore() {
        return aiScore;
    }

    public void setAiScore(Integer aiScore) {
        this.aiScore = aiScore;
    }

    public List<String> getRubricFeedback() {
        return rubricFeedback != null ? rubricFeedback : new ArrayList<>();
    }

    public void setRubricFeedback(List<String> rubricFeedback) {
        this.rubricFeedback = rubricFeedback;
    }

    public List<String> getBottlenecks() {
        return bottlenecks != null ? bottlenecks : new ArrayList<>();
    }

    public void setBottlenecks(List<String> bottlenecks) {
        this.bottlenecks = bottlenecks;
    }

    public List<String> getSuggestions() {
        return suggestions != null ? suggestions : new ArrayList<>();
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}
