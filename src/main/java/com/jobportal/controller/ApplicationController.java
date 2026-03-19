package com.jobportal.controller;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Application;
import com.jobportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Application> apply(@PathVariable Long jobId,
                                             @RequestBody JobDto.ApplicationRequest request,
                                             Principal principal) {
        return ResponseEntity.status(201).body(applicationService.apply(jobId, request, principal.getName()));
    }

    @GetMapping("/applications/my")
    @PreAuthorize("hasRole('USER')")
    public List<Application> myApplications(Principal principal) {
        return applicationService.myApplications(principal.getName());
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public List<Application> getByJob(@PathVariable Long jobId) {
        return applicationService.getByJob(jobId);
    }

    @PatchMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public Application updateStatus(@PathVariable Long id,
                                    @RequestBody JobDto.StatusUpdateRequest request) {
        return applicationService.updateStatus(id, request);
    }
}
