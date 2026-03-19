package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Job;
import com.jobportal.model.User;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Job create(JobDto.JobRequest request, String email) {
        User employer = userRepository.findByEmail(email).orElseThrow();
        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setJobType(request.getJobType());
        job.setPostedBy(employer);
        return jobRepository.save(job);
    }

    public List<Job> getAll() {
        return jobRepository.findByActiveTrue();
    }

    public List<Job> search(String keyword) {
        return jobRepository.findByTitleContainingIgnoreCaseAndActiveTrue(keyword);
    }

    public Job getById(Long id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public void delete(Long id, String email) {
        Job job = getById(id);
        if (!job.getPostedBy().getEmail().equals(email))
            throw new AccessDeniedException("Not your job posting");
        jobRepository.deleteById(id);
    }
}
