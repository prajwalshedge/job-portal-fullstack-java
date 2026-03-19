package com.jobportal.controller;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Job;
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

    @GetMapping
    public List<Job> getAll(@RequestParam(required = false) String keyword) {
        return keyword != null ? jobService.search(keyword) : jobService.getAll();
    }

    @GetMapping("/{id}")
    public Job getById(@PathVariable Long id) {
        return jobService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Job> create(@Valid @RequestBody JobDto.JobRequest request, Principal principal) {
        return ResponseEntity.status(201).body(jobService.create(request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        jobService.delete(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
