package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Application;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository        userRepository;
    private final JobRepository         jobRepository;
    private final EmailService          emailService;
    @Lazy
    private final MatchingService       matchingService;

    @Transactional
    public Application apply(Long jobId, JobDto.ApplicationRequest request, String email) {
        User applicant = userRepository.findByEmail(email).orElseThrow();
        if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicant.getId()))
            throw new IllegalStateException("Already applied to this job");

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Application app = new Application();
        app.setJob(job);
        app.setApplicant(applicant);
        app.setCoverLetter(request.getCoverLetter());
        Application saved = applicationRepository.save(app);

        matchingService.computeAndSave(saved);
        emailService.sendApplicationConfirmation(saved); // async — non-blocking
        return saved;
    }

    public List<Application> myApplications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return applicationRepository.findByApplicantId(user.getId());
    }

    public List<Application> getByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    @Transactional
    public Application updateStatus(Long appId, JobDto.StatusUpdateRequest request) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(request.getStatus());
        Application saved = applicationRepository.save(app);
        emailService.sendStatusUpdate(saved);             // async — non-blocking
        return saved;
    }
}
