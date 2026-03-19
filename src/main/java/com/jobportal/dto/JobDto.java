package com.jobportal.dto;

import com.jobportal.model.Application;
import com.jobportal.model.Job;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class JobDto {

    // ── Create ────────────────────────────────────────────────────────────────

    @Data
    public static class JobRequest {
        @NotBlank  private String title;
        @NotBlank  private String description;
        @NotBlank  private String company;
        private String   location;
        @Min(0)    private Integer minSalary;
        @Min(0)    private Integer maxSalary;
        private String   requiredSkills;
        @Min(0)    private Integer experienceYears;
        private Job.JobType jobType = Job.JobType.FULL_TIME;
        private LocalDate deadline;
    }

    // ── Update (all fields optional — only non-null values are applied) ───────

    @Data
    public static class JobUpdateRequest {
        private String      title;
        private String      description;
        private String      company;
        private String      location;
        private Integer     minSalary;
        private Integer     maxSalary;
        private String      requiredSkills;
        private Integer     experienceYears;
        private Job.JobType jobType;
        private LocalDate   deadline;
        private Boolean     active;
    }

    // ── Filter (all params optional) ─────────────────────────────────────────

    @Data
    public static class JobFilterRequest {
        private String      keyword;
        private String      location;
        private Integer     minSalary;
        private Integer     maxSalary;
        private String      skill;
        private Job.JobType jobType;
    }

    // ── Response (safe — no lazy collections) ────────────────────────────────

    @Data
    public static class JobResponse {
        private Long        id;
        private String      title;
        private String      description;
        private String      company;
        private String      location;
        private Integer     minSalary;
        private Integer     maxSalary;
        private String      requiredSkills;
        private Integer     experienceYears;
        private Job.JobType jobType;
        private LocalDate   deadline;
        private boolean     active;
        private String      recruiterName;
        private String      recruiterEmail;
        private int         applicationCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static JobResponse from(Job job) {
            JobResponse r = new JobResponse();
            r.id               = job.getId();
            r.title            = job.getTitle();
            r.description      = job.getDescription();
            r.company          = job.getCompany();
            r.location         = job.getLocation();
            r.minSalary        = job.getMinSalary();
            r.maxSalary        = job.getMaxSalary();
            r.requiredSkills   = job.getRequiredSkills();
            r.experienceYears  = job.getExperienceYears();
            r.jobType          = job.getJobType();
            r.deadline         = job.getDeadline();
            r.active           = job.isActive();
            r.recruiterName    = job.getPostedBy().getUser().getFullName();
            r.recruiterEmail   = job.getPostedBy().getUser().getEmail();
            r.applicationCount = job.getApplications().size();
            r.createdAt        = job.getCreatedAt();
            r.updatedAt        = job.getUpdatedAt();
            return r;
        }
    }

    // ── Application DTOs (kept here for cohesion) ─────────────────────────────

    @Data
    public static class ApplicationRequest {
        private String coverLetter;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotNull private Application.Status status;
    }
}
