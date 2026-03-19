package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Job;
import com.jobportal.model.Recruiter;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository      jobRepository;
    private final RecruiterRepository recruiterRepository;

    public Job create(JobDto.JobRequest request, String email) {
        Recruiter recruiter = recruiterRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found for: " + email));

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setJobType(request.getJobType());
        job.setPostedBy(recruiter);
        return jobRepository.save(job);
    }

    public List<Job> getAll() {
        return jobRepository.findByActiveTrue();
    }

    public List<Job> search(String keyword) {
        return jobRepository.findByTitleContainingIgnoreCaseAndActiveTrue(keyword);
    }

    public Job getById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public void delete(Long id, String email) {
        Job job = getById(id);
        if (!job.getPostedBy().getUser().getEmail().equals(email))
            throw new AccessDeniedException("Not your job posting");
        jobRepository.deleteById(id);
    }
}
