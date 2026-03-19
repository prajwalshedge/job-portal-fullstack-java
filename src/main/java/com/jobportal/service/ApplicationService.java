package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Application;
import com.jobportal.model.User;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobService jobService;

    public Application apply(Long jobId, JobDto.ApplicationRequest request, String email) {
        User applicant = userRepository.findByEmail(email).orElseThrow();
        if (applicationRepository.existsByJobIdAndApplicantId(jobId, applicant.getId()))
            throw new IllegalStateException("Already applied to this job");

        Application app = new Application();
        app.setJob(jobService.getById(jobId));
        app.setApplicant(applicant);
        app.setCoverLetter(request.getCoverLetter());
        return applicationRepository.save(app);
    }

    public List<Application> myApplications(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return applicationRepository.findByApplicantId(user.getId());
    }

    public List<Application> getByJob(Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }

    public Application updateStatus(Long appId, JobDto.StatusUpdateRequest request) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(request.getStatus());
        return applicationRepository.save(app);
    }
}
