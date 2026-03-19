package com.jobportal.service;

import com.jobportal.config.EmailProperties;
import com.jobportal.model.Application;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender       mailSender;
    private final EmailProperties      emailProperties;
    private final EmailTemplateBuilder templates;

    /**
     * Fired when a job seeker submits an application.
     * Sends two emails asynchronously:
     *   1. Confirmation to the applicant
     *   2. New-applicant alert to the recruiter
     */
    @Async
    public void sendApplicationConfirmation(Application app) {
        send(
            app.getApplicant().getEmail(),
            templates.applicationConfirmationSubject(app),
            templates.applicationConfirmationBody(app)
        );
        send(
            app.getJob().getPostedBy().getUser().getEmail(),
            templates.newApplicantSubject(app),
            templates.newApplicantBody(app)
        );
    }

    /**
     * Fired when a recruiter changes the application status.
     * Sends a status-update email to the applicant.
     */
    @Async
    public void sendStatusUpdate(Application app) {
        send(
            app.getApplicant().getEmail(),
            templates.statusUpdateSubject(app),
            templates.statusUpdateBody(app)
        );
    }

    // ── Internal helper ───────────────────────────────────────────────────────

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(emailProperties.getFrom());
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent to {} | subject: {}", to, subject);
        } catch (MailException ex) {
            // Log and swallow — email failure must never break the main flow
            log.error("Failed to send email to {} | subject: {} | reason: {}",
                    to, subject, ex.getMessage());
        }
    }
}
