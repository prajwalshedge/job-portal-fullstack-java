package com.jobportal.controller;

import com.jobportal.dto.MatchDto;
import com.jobportal.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    /**
     * GET /api/match/job/{jobId}/candidates
     * Recruiter sees all applicants ranked by match score (highest first).
     */
    @GetMapping("/job/{jobId}/candidates")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public List<MatchDto.CandidateRankResponse> rankedCandidates(@PathVariable Long jobId) {
        return matchingService.rankedCandidates(jobId);
    }

    /**
     * GET /api/match/job/{jobId}/my-score
     * Job seeker sees their own match score and verdict for a specific job.
     */
    @GetMapping("/job/{jobId}/my-score")
    @PreAuthorize("hasRole('USER')")
    public MatchDto.JobMatchResponse myScore(@PathVariable Long jobId, Principal principal) {
        return matchingService.myScore(jobId, principal.getName());
    }

    /**
     * POST /api/match/job/{jobId}/recompute
     * Recomputes scores for all applicants of a job (e.g. after job skills are edited).
     */
    @PostMapping("/job/{jobId}/recompute")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> recomputeForJob(@PathVariable Long jobId) {
        int count = matchingService.recomputeForJob(jobId);
        return ResponseEntity.ok(Map.of("recomputed", count, "jobId", jobId));
    }
}
