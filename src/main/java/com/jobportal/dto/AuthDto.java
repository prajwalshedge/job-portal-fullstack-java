package com.jobportal.dto;

import com.jobportal.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String fullName;
        private String role = "USER";  // accepts "USER", "RECRUITER", "ADMIN"
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String email;
        private String fullName;
        private String role;

        public AuthResponse(String accessToken, String refreshToken, User user) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.role = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(java.util.stream.Collectors.joining(","));
        }
    }

    @Data
    public static class MeResponse {
        private Long id;
        private String email;
        private String fullName;
        private String skills;
        private String resumeLink;
        private String role;

        public MeResponse(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.skills = user.getSkills();
            this.resumeLink = user.getResumeLink();
            this.role = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(java.util.stream.Collectors.joining(","));
        }
    }
}
