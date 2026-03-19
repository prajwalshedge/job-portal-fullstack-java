package com.jobportal.controller;

import com.jobportal.dto.ResumeDto;
import com.jobportal.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class ResumeController {

    private final ResumeService resumeService;

    /**
     * POST /api/resume/upload
     * Content-Type: multipart/form-data
     * Form field: file (PDF, max 5 MB)
     */
    @PostMapping("/upload")
    public ResponseEntity<ResumeDto.ResumeResponse> upload(
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        return ResponseEntity.status(201)
                .body(resumeService.upload(file, principal.getName()));
    }

    /**
     * GET /api/resume
     * Returns the current user's resume metadata and extracted skills.
     */
    @GetMapping
    public ResumeDto.ResumeResponse get(Principal principal) {
        return resumeService.get(principal.getName());
    }

    /**
     * DELETE /api/resume
     * Removes the stored file and clears skills from the user profile.
     */
    @DeleteMapping
    public ResponseEntity<Void> delete(Principal principal) throws IOException {
        resumeService.delete(principal.getName());
        return ResponseEntity.noContent().build();
    }
}
