package com.jobportal.controller;

import com.jobportal.dto.AdminDto;
import com.jobportal.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /** GET /api/admin/analytics — totals + charts data */
    @GetMapping("/analytics")
    public AdminDto.AnalyticsResponse analytics() {
        return adminService.getAnalytics();
    }

    /** GET /api/admin/users — all users (no passwords) */
    @GetMapping("/users")
    public List<AdminDto.UserAdminResponse> users() {
        return adminService.getAllUsers();
    }

    /** DELETE /api/admin/users/{id} */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/admin/jobs — all jobs */
    @GetMapping("/jobs")
    public List<AdminDto.JobAdminResponse> jobs() {
        return adminService.getAllJobs();
    }

    /** DELETE /api/admin/jobs/{id} */
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
