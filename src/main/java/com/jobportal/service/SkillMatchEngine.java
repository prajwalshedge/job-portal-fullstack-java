package com.jobportal.service;

import com.jobportal.config.ScoringWeights;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SkillMatchEngine {

    private final ScoringWeights weights;

    // ── Public API ────────────────────────────────────────────────────────────

    public Result score(
            String resumeSkillsCsv,
            String jobSkillsCsv,
            String resumeRawText,
            String jobTitle,
            Integer candidateExperience,   // may be null
            Integer requiredExperience     // may be null
    ) {
        Set<String> resumeSkills = parseSkills(resumeSkillsCsv);
        Set<String> jobSkills    = parseSkills(jobSkillsCsv);

        double skillScore      = computeSkillScore(resumeSkills, jobSkills);
        double experienceScore = computeExperienceScore(candidateExperience, requiredExperience);
        double titleScore      = computeTitleScore(resumeRawText, jobTitle);

        double overall = round2(
            skillScore      * weights.getSkillWeight()      * 100 +
            experienceScore * weights.getExperienceWeight() * 100 +
            titleScore      * weights.getTitleWeight()      * 100
        );

        Set<String> matched = intersection(resumeSkills, jobSkills);
        Set<String> missing = difference(jobSkills, resumeSkills);

        return new Result(
            Math.min(overall, 100.0),
            round2(skillScore      * 100),
            round2(experienceScore * 100),
            round2(titleScore      * 100),
            String.join(",", matched),
            String.join(",", missing)
        );
    }

    // ── Scoring components ────────────────────────────────────────────────────

    /**
     * Jaccard similarity: |A ∩ B| / |A ∪ B|
     * Returns 0–1. Returns 1.0 when both sets are empty (no skills required = full match).
     */
    private double computeSkillScore(Set<String> resume, Set<String> job) {
        if (job.isEmpty()) return 1.0;
        if (resume.isEmpty()) return 0.0;
        int intersect = intersection(resume, job).size();
        int union     = union(resume, job).size();
        return (double) intersect / union;
    }

    /**
     * Linear experience fit:
     * - No requirement → full score
     * - Candidate meets or exceeds requirement → full score
     * - Each year below requirement → subtract experienceGapPenalty
     * - Result clamped to [0, 1]
     */
    private double computeExperienceScore(Integer candidate, Integer required) {
        if (required == null || required == 0) return 1.0;
        int cand = (candidate == null) ? 0 : candidate;
        if (cand >= required) return 1.0;
        int gap     = required - cand;
        double score = 1.0 - (gap * weights.getExperienceGapPenalty());
        return Math.max(0.0, score);
    }

    /**
     * Title keyword overlap: fraction of significant words in the job title
     * that appear in the resume raw text (case-insensitive).
     * Stop-words (and, or, the, a, an, for, in, at, with) are excluded.
     */
    private double computeTitleScore(String resumeText, String jobTitle) {
        if (jobTitle == null || jobTitle.isBlank()) return 1.0;
        if (resumeText == null || resumeText.isBlank()) return 0.0;

        Set<String> stopWords = Set.of("and", "or", "the", "a", "an", "for", "in", "at", "with", "of");
        String lowerResume = resumeText.toLowerCase();

        String[] titleWords = jobTitle.toLowerCase().split("[\\s/\\-]+");
        long significant = Arrays.stream(titleWords)
                .filter(w -> !stopWords.contains(w) && w.length() > 1)
                .count();

        if (significant == 0) return 1.0;

        long matched = Arrays.stream(titleWords)
                .filter(w -> !stopWords.contains(w) && w.length() > 1)
                .filter(lowerResume::contains)
                .count();

        return (double) matched / significant;
    }

    // ── Set helpers ───────────────────────────────────────────────────────────

    private Set<String> parseSkills(String csv) {
        if (csv == null || csv.isBlank()) return Collections.emptySet();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> intersection(Set<String> a, Set<String> b) {
        return a.stream().filter(b::contains).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> difference(Set<String> a, Set<String> b) {
        return a.stream().filter(s -> !b.contains(s)).collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> union(Set<String> a, Set<String> b) {
        Set<String> u = new LinkedHashSet<>(a);
        u.addAll(b);
        return u;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // ── Result record ─────────────────────────────────────────────────────────

    public record Result(
        double overall,
        double skillScore,
        double experienceScore,
        double titleScore,
        String matchedSkills,
        String missingSkills
    ) {}
}
