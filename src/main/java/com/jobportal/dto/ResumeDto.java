package com.jobportal.dto;

import com.jobportal.model.Resume;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public class ResumeDto {

    @Data
    public static class ResumeResponse {
        private Long          id;
        private String        originalFilename;
        private Long          fileSizeBytes;
        private List<String>  extractedSkills;
        private LocalDateTime uploadedAt;

        public static ResumeResponse from(Resume resume) {
            ResumeResponse r = new ResumeResponse();
            r.id               = resume.getId();
            r.originalFilename = resume.getOriginalFilename();
            r.fileSizeBytes    = resume.getFileSizeBytes();
            r.uploadedAt       = resume.getUploadedAt();
            r.extractedSkills  = (resume.getExtractedSkills() == null
                    || resume.getExtractedSkills().isBlank())
                    ? List.of()
                    : Arrays.asList(resume.getExtractedSkills().split(","));
            return r;
        }
    }
}
