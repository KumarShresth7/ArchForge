package com.archforge.service;

import com.archforge.dto.RecommendedProblemDto;
import com.archforge.model.Problem;
import com.archforge.model.Submission;
import com.archforge.model.User;
import com.archforge.model.UserProblemProgress;
import com.archforge.repository.ProblemRepository;
import com.archforge.repository.SubmissionRepository;
import com.archforge.repository.UserProblemProgressRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PersonalizationService {

    public static final double SOLVED_THRESHOLD = 70.0;
    private static final Map<String, Integer> DIFFICULTY_RANK = Map.of(
            "easy", 0,
            "medium", 1,
            "hard", 2
    );

    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final UserProblemProgressRepository progressRepository;

    public PersonalizationService(
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository,
            UserProblemProgressRepository progressRepository
    ) {
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.progressRepository = progressRepository;
    }

    public void updateUserStreak(User user) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate last = user.getLastActiveDate() != null
                ? user.getLastActiveDate().atZone(ZoneOffset.UTC).toLocalDate()
                : null;

        if (today.equals(last)) {
            return;
        }

        if (last != null && last.equals(today.minusDays(1))) {
            user.setCurrentStreak(user.getCurrentStreak() + 1);
        } else {
            user.setCurrentStreak(1);
        }

        user.setLongestStreak(Math.max(user.getLongestStreak(), user.getCurrentStreak()));
        user.setLastActiveDate(Instant.now());
    }

    public Map<String, Integer> computeSkillProfile(String userId) {
        List<Submission> submissions = submissionRepository.findByUserId(userId);
        if (submissions.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Problem> problemsBySlug = problemRepository.findAll().stream()
                .collect(Collectors.toMap(Problem::getSlug, p -> p, (a, b) -> a));

        Map<String, List<Integer>> tagScores = new HashMap<>();
        for (Submission sub : submissions) {
            Problem p = problemsBySlug.get(sub.getProblemSlug());
            if (p == null || p.getTags() == null) continue;
            for (String tag : p.getTags()) {
                tagScores.computeIfAbsent(tag, k -> new ArrayList<>()).add(sub.getScore());
            }
        }

        Map<String, Integer> profile = new HashMap<>();
        for (Map.Entry<String, List<Integer>> entry : tagScores.entrySet()) {
            double avg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
            profile.put(entry.getKey(), (int) Math.round(avg));
        }
        return profile;
    }

    public String getUserLevel(int solvedCount) {
        if (solvedCount >= 8) return "hard";
        if (solvedCount >= 3) return "medium";
        return "easy";
    }

    public List<RecommendedProblemDto> recommendProblems(String userId, int limit) {
        List<Problem> allProblems = problemRepository.findAll();
        List<UserProblemProgress> progressRows = progressRepository.findByUserId(userId);

        Set<String> solvedSlugs = progressRows.stream()
                .filter(p -> "solved".equalsIgnoreCase(p.getStatus()))
                .map(UserProblemProgress::getProblemSlug)
                .collect(Collectors.toSet());

        Map<String, Integer> skillProfile = computeSkillProfile(userId);

        List<Map.Entry<String, Integer>> weakTags = skillProfile.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .limit(2)
                .toList();
        Set<String> weakTagNames = weakTags.stream().map(Map.Entry::getKey).collect(Collectors.toSet());

        String userLevel = getUserLevel(solvedSlugs.size());
        int userLevelRank = DIFFICULTY_RANK.getOrDefault(userLevel, 1);

        List<Problem> candidates = allProblems.stream()
                .filter(p -> !solvedSlugs.contains(p.getSlug()))
                .sorted((p1, p2) -> {
                    Set<String> p1Tags = new HashSet<>(p1.getTags() != null ? p1.getTags() : Collections.emptyList());
                    Set<String> p2Tags = new HashSet<>(p2.getTags() != null ? p2.getTags() : Collections.emptyList());

                    p1Tags.retainAll(weakTagNames);
                    p2Tags.retainAll(weakTagNames);
                    int overlapComp = Integer.compare(p2Tags.size(), p1Tags.size());
                    if (overlapComp != 0) return overlapComp;

                    int p1Diff = Math.abs(DIFFICULTY_RANK.getOrDefault(p1.getDifficulty(), 1) - userLevelRank);
                    int p2Diff = Math.abs(DIFFICULTY_RANK.getOrDefault(p2.getDifficulty(), 1) - userLevelRank);
                    int diffPenaltyComp = Integer.compare(p1Diff, p2Diff);
                    if (diffPenaltyComp != 0) return diffPenaltyComp;

                    return Integer.compare(
                            DIFFICULTY_RANK.getOrDefault(p2.getDifficulty(), 0),
                            DIFFICULTY_RANK.getOrDefault(p1.getDifficulty(), 0)
                    );
                })
                .limit(limit)
                .toList();

        List<RecommendedProblemDto> results = new ArrayList<>();
        for (Problem problem : candidates) {
            Set<String> overlap = new HashSet<>(problem.getTags() != null ? problem.getTags() : Collections.emptyList());
            overlap.retainAll(weakTagNames);

            String reason;
            if (!overlap.isEmpty() && !skillProfile.isEmpty()) {
                String weakest = overlap.stream()
                        .min(Comparator.comparingInt(t -> skillProfile.getOrDefault(t, 100)))
                        .orElse(overlap.iterator().next());
                reason = "Strengthen your " + weakest.replace("-", " ") + " skills";
            } else if (problem.getDifficulty().equalsIgnoreCase(userLevel)) {
                reason = "Good " + problem.getDifficulty() + " challenge for your level";
            } else {
                reason = "Expand your system design breadth";
            }
            results.add(new RecommendedProblemDto(problem.getSlug(), reason));
        }

        return results;
    }

    public List<String> similarProblems(String slug, int limit) {
        List<Problem> allProblems = problemRepository.findAll();
        Optional<Problem> sourceOpt = allProblems.stream().filter(p -> p.getSlug().equals(slug)).findFirst();
        if (sourceOpt.isEmpty()) {
            return Collections.emptyList();
        }

        Problem source = sourceOpt.get();
        Set<String> sourceTags = new HashSet<>(source.getTags() != null ? source.getTags() : Collections.emptyList());

        record ScoredProblem(Problem problem, int overlap) {}

        List<ScoredProblem> scored = new ArrayList<>();
        for (Problem p : allProblems) {
            if (p.getSlug().equals(slug)) continue;
            Set<String> tags = new HashSet<>(p.getTags() != null ? p.getTags() : Collections.emptyList());
            tags.retainAll(sourceTags);
            if (!tags.isEmpty()) {
                scored.add(new ScoredProblem(p, tags.size()));
            }
        }

        scored.sort((a, b) -> {
            int comp = Integer.compare(b.overlap(), a.overlap());
            if (comp != 0) return comp;
            return Integer.compare(
                    DIFFICULTY_RANK.getOrDefault(b.problem().getDifficulty(), 0),
                    DIFFICULTY_RANK.getOrDefault(a.problem().getDifficulty(), 0)
            );
        });

        return scored.stream().limit(limit).map(s -> s.problem().getSlug()).toList();
    }

    public boolean hintsAreUnlocked(UserProblemProgress progress) {
        if (progress == null) return false;
        if (progress.getHintsUnlocked()) return true;
        return progress.getAttemptCount() >= 1
                && progress.getBestScore() != null
                && progress.getBestScore() < SOLVED_THRESHOLD;
    }
}
