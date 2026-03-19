package com.jobportal.service;

import com.jobportal.model.Application;
import org.springframework.stereotype.Component;

@Component
public class EmailTemplateBuilder {

    // ── Application confirmation (to job seeker) ──────────────────────────────

    public String applicationConfirmationSubject(Application app) {
        return "Application Received – " + app.getJob().getTitle()
                + " at " + app.getJob().getCompany();
    }

    public String applicationConfirmationBody(Application app) {
        return """
                Hi %s,

                Your application for the position of "%s" at %s has been successfully submitted.

                Application ID : #%d
                Status         : %s
                Applied on     : %s

                We will notify you as soon as the recruiter reviews your application.

                Best regards,
                Job Portal Team
                """.formatted(
                app.getApplicant().getFullName(),
                app.getJob().getTitle(),
                app.getJob().getCompany(),
                app.getId(),
                app.getStatus(),
                app.getAppliedAt().toLocalDate()
        );
    }

    // ── Application confirmation (to recruiter) ───────────────────────────────

    public String newApplicantSubject(Application app) {
        return "New Applicant – " + app.getJob().getTitle();
    }

    public String newApplicantBody(Application app) {
        return """
                Hi %s,

                A new candidate has applied for your job posting.

                Job Title   : %s
                Candidate   : %s (%s)
                Applied on  : %s

                Log in to the portal to review the application and update the status.

                Best regards,
                Job Portal Team
                """.formatted(
                app.getJob().getPostedBy().getUser().getFullName(),
                app.getJob().getTitle(),
                app.getApplicant().getFullName(),
                app.getApplicant().getEmail(),
                app.getAppliedAt().toLocalDate()
        );
    }

    // ── Status update (to job seeker) ─────────────────────────────────────────

    public String statusUpdateSubject(Application app) {
        return "Application Update – " + app.getJob().getTitle()
                + " [" + app.getStatus() + "]";
    }

    public String statusUpdateBody(Application app) {
        return """
                Hi %s,

                Your application for "%s" at %s has been updated.

                New Status     : %s
                Application ID : #%d

                %s

                Log in to the portal to view full details.

                Best regards,
                Job Portal Team
                """.formatted(
                app.getApplicant().getFullName(),
                app.getJob().getTitle(),
                app.getJob().getCompany(),
                app.getStatus(),
                app.getId(),
                statusMessage(app.getStatus())
        );
    }

    private String statusMessage(Application.Status status) {
        return switch (status) {
            case REVIEWED    -> "The recruiter has reviewed your application.";
            case SHORTLISTED -> "Congratulations! You have been shortlisted for the next round.";
            case REJECTED    -> "Unfortunately, your application was not selected at this time.";
            case HIRED       -> "Congratulations! You have been selected for this position!";
            default          -> "";
        };
    }
}
