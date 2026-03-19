package com.jobportal.dto;

import com.jobportal.model.Application;
import com.jobportal.model.Job;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class JobDto {

    @Data
    public static class JobRequest {
        @NotBlank private String title;
        @NotBlank private String description;
        @NotBlank private String company;
        private String location;
        private String salary;
        private Job.JobType jobType = Job.JobType.FULL_TIME;
    }

    @Data
    public static class ApplicationRequest {
        private String coverLetter;
    }

    @Data
    public static class StatusUpdateRequest {
        private Application.Status status;
    }
}
