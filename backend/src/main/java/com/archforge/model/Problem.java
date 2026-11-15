package com.archforge.model;

import com.archforge.converter.JsonListConverter;
import com.archforge.converter.JsonMapConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @Column(nullable = false)
    private String id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String difficulty;

    @Convert(converter = JsonListConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Convert(converter = JsonListConverter.class)
    @Column(name = "functional_requirements", nullable = false, columnDefinition = "TEXT")
    private List<String> functionalRequirements = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(name = "non_functional_requirements", nullable = false, columnDefinition = "TEXT")
    private List<String> nonFunctionalRequirements = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private List<String> hints = new ArrayList<>();

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "starter_graph", nullable = false, columnDefinition = "TEXT")
    private Map<String, Object> starterGraph = new HashMap<>();

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "evaluation_rubric", columnDefinition = "TEXT")
    private Map<String, Object> evaluationRubric = new HashMap<>();

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "reference_solution", columnDefinition = "TEXT")
    private Map<String, Object> referenceSolution;

    public Problem() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getFunctionalRequirements() {
        return functionalRequirements;
    }

    public void setFunctionalRequirements(List<String> functionalRequirements) {
        this.functionalRequirements = functionalRequirements;
    }

    public List<String> getNonFunctionalRequirements() {
        return nonFunctionalRequirements;
    }

    public void setNonFunctionalRequirements(List<String> nonFunctionalRequirements) {
        this.nonFunctionalRequirements = nonFunctionalRequirements;
    }

    public List<String> getHints() {
        return hints;
    }

    public void setHints(List<String> hints) {
        this.hints = hints;
    }

    public Map<String, Object> getStarterGraph() {
        return starterGraph;
    }

    public void setStarterGraph(Map<String, Object> starterGraph) {
        this.starterGraph = starterGraph;
    }

    public Map<String, Object> getEvaluationRubric() {
        return evaluationRubric;
    }

    public void setEvaluationRubric(Map<String, Object> evaluationRubric) {
        this.evaluationRubric = evaluationRubric;
    }

    public Map<String, Object> getReferenceSolution() {
        return referenceSolution;
    }

    public void setReferenceSolution(Map<String, Object> referenceSolution) {
        this.referenceSolution = referenceSolution;
    }
}
