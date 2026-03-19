package com.jobportal.dto;

import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDto {

    @Data
    public static class AnalyticsResponse {
        // Totals
        private long totalUsers;
        private long totalRecruiters;
        private long totalJobs;
        private long activeJobs;
        private long totalApplications;
        private long totalResumes;

        // Applications by status
        private Map<String, Long> applicationsByStatus;

        // Jobs by type
        private Map<String, Long> jobsByType;

        // Registrations per day — last 30 days  { "2024-06-01": 3, ... }
        private Map<String, Long> registrationsPerDay;

        // Applications per day — last 30 days
        private Map<String, Long> applicationsPerDay;
    }

    @Data
    public static class UserAdminResponse {
        private Long          id;
        private String        fullName;
        private String        email;
        private String        phone;
        private String        skills;
        private String        role;
        private boolean       hasResume;
        private int           applicationCount;
        private LocalDateTime createdAt;

        public static UserAdminResponse from(User user) {
            UserAdminResponse r = new UserAdminResponse();
            r.id               = user.getId();
            r.fullName         = user.getFullName();
            r.email            = user.getEmail();
            r.phone            = user.getPhone();
            r.skills           = user.getSkills();
            r.role             = user.getRoles().stream()
                                     .map(role -> role.getName().name())
                                     .findFirst().orElse("USER");
            r.hasResume        = user.getResumeLink() != null;
            r.applicationCount = user.getApplications().size();
            r.createdAt        = user.getCreatedAt();
            return r;
        }
    }

    @Data
    public static class JobAdminResponse {
        private Long          id;
        private String        title;
        private String        company;
        private String        location;
        private String        jobType;
        private boolean       active;
        private String        recruiterName;
        private String        recruiterEmail;
        private int           applicationCount;
        private LocalDateTime createdAt;

        public static JobAdminResponse from(Job job) {
            JobAdminResponse r = new JobAdminResponse();
            r.id               = job.getId();
            r.title            = job.getTitle();
            r.company          = job.getCompany();
            r.location         = job.getLocation();
            r.jobType          = job.getJobType().name();
            r.active           = job.isActive();
            r.recruiterName    = job.getPostedBy().getUser().getFullName();
            r.recruiterEmail   = job.getPostedBy().getUser().getEmail();
            r.applicationCount = job.getApplications().size();
            r.createdAt        = job.getCreatedAt();
            return r;
        }
    }
}
