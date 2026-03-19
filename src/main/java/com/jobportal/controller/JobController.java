package com.jobportal.controller;

import com.jobportal.dto.JobDto;
import com.jobportal.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    // ── Public endpoints (no auth required) ──────────────────────────────────

    /** List all active jobs */
    @GetMapping
    public List<JobDto.JobResponse> getAll() {
        return jobService.getAll();
    }

    /** Get a single active job by ID */
    @GetMapping("/{id}")
    public JobDto.JobResponse getById(@PathVariable Long id) {
        return jobService.getById(id);
    }

    /**
     * Filter jobs — all params are optional and combinable:
     * ?keyword=java&location=bangalore&minSalary=50000&maxSalary=150000&skill=spring&jobType=FULL_TIME
     */
    @GetMapping("/filter")
    public List<JobDto.JobResponse> filter(JobDto.JobFilterRequest req) {
        return jobService.filter(req);
    }

    // ── Recruiter endpoints ───────────────────────────────────────────────────

    /** List all jobs posted by the authenticated recruiter */
    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public List<JobDto.JobResponse> myJobs(Principal principal) {
        return jobService.myJobs(principal.getName());
    }

    /** Post a new job */
    @PostMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<JobDto.JobResponse> create(
            @Valid @RequestBody JobDto.JobRequest request,
            Principal principal) {
        return ResponseEntity.status(201).body(jobService.create(request, principal.getName()));
    }

    /** Update own job — patch style, only supplied fields are changed */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public JobDto.JobResponse update(
            @PathVariable Long id,
            @RequestBody JobDto.JobUpdateRequest request,
            Principal principal) {
        return jobService.update(id, request, principal.getName());
    }

    /** Delete own job */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        jobService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
