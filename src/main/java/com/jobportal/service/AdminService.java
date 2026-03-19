package com.jobportal.service;

import com.jobportal.dto.AdminDto;
import com.jobportal.model.Role;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository        userRepository;
    private final JobRepository         jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository      resumeRepository;

    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ── Analytics ─────────────────────────────────────────────────────────────

    public AdminDto.AnalyticsResponse getAnalytics() {
        AdminDto.AnalyticsResponse r = new AdminDto.AnalyticsResponse();

        r.setTotalUsers(userRepository.countByRolesName(Role.RoleName.USER));
        r.setTotalRecruiters(userRepository.countByRolesName(Role.RoleName.RECRUITER));
        r.setTotalJobs(jobRepository.count());
        r.setActiveJobs(jobRepository.countByActiveTrue());
        r.setTotalApplications(applicationRepository.count());
        r.setTotalResumes(resumeRepository.count());

        // Applications by status
        r.setApplicationsByStatus(
            applicationRepository.countByStatus().stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> (Long) row[1],
                    (a, b) -> a,
                    LinkedHashMap::new
                ))
        );

        // Jobs by type
        r.setJobsByType(
            jobRepository.countByJobType().stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> (Long) row[1],
                    (a, b) -> a,
                    LinkedHashMap::new
                ))
        );

        LocalDateTime since = LocalDateTime.now().minusDays(30);

        // Registrations per day
        r.setRegistrationsPerDay(toDateMap(userRepository.countRegistrationsPerDay(since)));

        // Applications per day
        r.setApplicationsPerDay(toDateMap(applicationRepository.countApplicationsPerDay(since)));

        return r;
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    public List<AdminDto.UserAdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminDto.UserAdminResponse::from)
                .toList();
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id))
            throw new RuntimeException("User not found");
        userRepository.deleteById(id);
    }

    // ── Jobs ──────────────────────────────────────────────────────────────────

    public List<AdminDto.JobAdminResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(AdminDto.JobAdminResponse::from)
                .toList();
    }

    @Transactional
    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id))
            throw new RuntimeException("Job not found");
        jobRepository.deleteById(id);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Map<String, Long> toDateMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
            row -> row[0].toString(),
            row -> (Long) row[1],
            (a, b) -> a,
            LinkedHashMap::new
        ));
    }
}
