package com.jobportal.service;

import com.jobportal.dto.MatchDto;
import com.jobportal.model.*;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private final MatchScoreRepository  matchScoreRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository      resumeRepository;
    private final UserRepository        userRepository;
    private final SkillMatchEngine      engine;

    // ── Called automatically on every new application ─────────────────────────

    @Transactional
    public MatchScore computeAndSave(Application application) {
        Job  job  = application.getJob();
        User user = application.getApplicant();

        Resume resume = resumeRepository.findByUserId(user.getId()).orElse(null);

        String resumeSkills  = user.getSkills();
        String resumeRawText = (resume != null) ? resume.getExtractedText() : "";
        // Candidate experience: derive from resume raw text heuristic if not stored
        Integer candidateExp = parseExperienceFromText(resumeRawText);

        SkillMatchEngine.Result result = engine.score(
                resumeSkills,
                job.getRequiredSkills(),
                resumeRawText,
                job.getTitle(),
                candidateExp,
                job.getExperienceYears()
        );

        // Upsert — recompute if application already has a score (e.g. resume re-uploaded)
        MatchScore ms = matchScoreRepository
                .findByApplicationId(application.getId())
                .orElse(new MatchScore());

        ms.setApplication(application);
        ms.setJob(job);
        ms.setUser(user);
        ms.setScore(result.overall());
        ms.setSkillScore(result.skillScore());
        ms.setExperienceScore(result.experienceScore());
        ms.setTitleScore(result.titleScore());
        ms.setMatchedSkills(result.matchedSkills());
        ms.setMissingSkills(result.missingSkills());

        return matchScoreRepository.save(ms);
    }

    // ── Recruiter: ranked candidate list for a job ────────────────────────────

    public List<MatchDto.CandidateRankResponse> rankedCandidates(Long jobId) {
        List<MatchScore> scores = matchScoreRepository.findByJobIdOrderByScoreDesc(jobId);
        AtomicInteger rank = new AtomicInteger(1);
        return scores.stream()
                .map(ms -> MatchDto.CandidateRankResponse.from(ms, rank.getAndIncrement()))
                .toList();
    }

    // ── Job seeker: their own score for a specific job ────────────────────────

    public MatchDto.JobMatchResponse myScore(Long jobId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MatchScore ms = matchScoreRepository.findByJobIdAndUserId(jobId, user.getId())
                .orElseThrow(() -> new RuntimeException(
                        "No match score found — have you applied to this job?"));

        return MatchDto.JobMatchResponse.from(ms);
    }

    // ── Recompute all scores for a job (e.g. after job skills are updated) ────

    @Transactional
    public int recomputeForJob(Long jobId) {
        List<Application> applications = applicationRepository.findByJobId(jobId);
        applications.forEach(this::computeAndSave);
        return applications.size();
    }

    // ── Recompute all scores for a user (e.g. after resume re-upload) ─────────

    @Transactional
    public int recomputeForUser(Long userId) {
        List<Application> applications = applicationRepository.findByApplicantId(userId);
        applications.forEach(this::computeAndSave);
        return applications.size();
    }

    // ── Heuristic: extract years of experience from raw resume text ───────────
    // Looks for patterns like "3 years", "5+ years", "2 yrs"

    private Integer parseExperienceFromText(String text) {
        if (text == null || text.isBlank()) return null;
        var matcher = java.util.regex.Pattern
                .compile("(\\d+)\\s*\\+?\\s*(?:years?|yrs?)[\\s\\w]{0,10}experience",
                        java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text);
        int max = 0;
        boolean found = false;
        while (matcher.find()) {
            found = true;
            max = Math.max(max, Integer.parseInt(matcher.group(1)));
        }
        return found ? max : null;
    }
}
