package com.jobportal.dto;

import com.jobportal.model.MatchScore;
import lombok.Data;

import java.util.Arrays;
import java.util.List;

public class MatchDto {

    /** Returned to a recruiter — one entry per applicant, sorted by score desc */
    @Data
    public static class CandidateRankResponse {
        private Long        applicationId;
        private Long        userId;
        private String      candidateName;
        private String      candidateEmail;
        private double      score;
        private double      skillScore;
        private double      experienceScore;
        private double      titleScore;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private int         rank;

        public static CandidateRankResponse from(MatchScore ms, int rank) {
            CandidateRankResponse r = new CandidateRankResponse();
            r.applicationId    = ms.getApplication().getId();
            r.userId           = ms.getUser().getId();
            r.candidateName    = ms.getUser().getFullName();
            r.candidateEmail   = ms.getUser().getEmail();
            r.score            = ms.getScore();
            r.skillScore       = ms.getSkillScore();
            r.experienceScore  = ms.getExperienceScore();
            r.titleScore       = ms.getTitleScore();
            r.matchedSkills    = splitCsv(ms.getMatchedSkills());
            r.missingSkills    = splitCsv(ms.getMissingSkills());
            r.rank             = rank;
            return r;
        }
    }

    /** Returned to a job seeker — their own score for a specific job */
    @Data
    public static class JobMatchResponse {
        private Long        jobId;
        private String      jobTitle;
        private double      score;
        private double      skillScore;
        private double      experienceScore;
        private double      titleScore;
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private String      verdict;   // EXCELLENT / GOOD / FAIR / LOW

        public static JobMatchResponse from(MatchScore ms) {
            JobMatchResponse r = new JobMatchResponse();
            r.jobId           = ms.getJob().getId();
            r.jobTitle        = ms.getJob().getTitle();
            r.score           = ms.getScore();
            r.skillScore      = ms.getSkillScore();
            r.experienceScore = ms.getExperienceScore();
            r.titleScore      = ms.getTitleScore();
            r.matchedSkills   = splitCsv(ms.getMatchedSkills());
            r.missingSkills   = splitCsv(ms.getMissingSkills());
            r.verdict         = verdict(ms.getScore());
            return r;
        }

        private static String verdict(double score) {
            if (score >= 75) return "EXCELLENT";
            if (score >= 50) return "GOOD";
            if (score >= 25) return "FAIR";
            return "LOW";
        }
    }

    private static List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.asList(csv.split(","));
    }
}
