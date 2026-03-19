package com.jobportal.service;

import com.jobportal.dto.JobDto;
import com.jobportal.model.Job;
import com.jobportal.model.Recruiter;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.JobSpecification;
import com.jobportal.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository       jobRepository;
    private final RecruiterRepository recruiterRepository;

    // ── Recruiter operations ──────────────────────────────────────────────────

    @Transactional
    public JobDto.JobResponse create(JobDto.JobRequest req, String email) {
        Recruiter recruiter = findRecruiter(email);
        Job job = new Job();
        applyRequest(job, req);
        job.setPostedBy(recruiter);
        return JobDto.JobResponse.from(jobRepository.save(job));
    }

    @Transactional
    public JobDto.JobResponse update(Long id, JobDto.JobUpdateRequest req, String email) {
        Job job = getJobOwnedBy(id, email);
        applyUpdate(job, req);
        return JobDto.JobResponse.from(jobRepository.save(job));
    }

    @Transactional
    public void delete(Long id, String email) {
        Job job = getJobOwnedBy(id, email);
        jobRepository.delete(job);
    }

    public List<JobDto.JobResponse> myJobs(String email) {
        Recruiter recruiter = findRecruiter(email);
        return jobRepository.findByPostedById(recruiter.getId())
                .stream().map(JobDto.JobResponse::from).toList();
    }

    // ── Public / job-seeker operations ───────────────────────────────────────

    public List<JobDto.JobResponse> getAll() {
        return jobRepository.findByActiveTrue()
                .stream().map(JobDto.JobResponse::from).toList();
    }

    public JobDto.JobResponse getById(Long id) {
        return JobDto.JobResponse.from(findActive(id));
    }

    public List<JobDto.JobResponse> filter(JobDto.JobFilterRequest req) {
        var spec = JobSpecification.withFilters(
                req.getKeyword(),
                req.getLocation(),
                req.getMinSalary(),
                req.getMaxSalary(),
                req.getSkill(),
                req.getJobType(),
                true            // always filter active=true for public search
        );
        return jobRepository.findAll(spec)
                .stream().map(JobDto.JobResponse::from).toList();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Recruiter findRecruiter(String email) {
        return recruiterRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found for: " + email));
    }

    private Job findActive(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.isActive()) throw new RuntimeException("Job is no longer active");
        return job;
    }

    private Job getJobOwnedBy(Long id, String email) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.getPostedBy().getUser().getEmail().equals(email))
            throw new AccessDeniedException("You do not own this job posting");
        return job;
    }

    private void applyRequest(Job job, JobDto.JobRequest req) {
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setCompany(req.getCompany());
        job.setLocation(req.getLocation());
        job.setMinSalary(req.getMinSalary());
        job.setMaxSalary(req.getMaxSalary());
        job.setRequiredSkills(req.getRequiredSkills());
        job.setExperienceYears(req.getExperienceYears());
        job.setJobType(req.getJobType() != null ? req.getJobType() : Job.JobType.FULL_TIME);
        job.setDeadline(req.getDeadline());
    }

    // Patch-style: only overwrite fields that are non-null in the request
    private void applyUpdate(Job job, JobDto.JobUpdateRequest req) {
        if (req.getTitle()           != null) job.setTitle(req.getTitle());
        if (req.getDescription()     != null) job.setDescription(req.getDescription());
        if (req.getCompany()         != null) job.setCompany(req.getCompany());
        if (req.getLocation()        != null) job.setLocation(req.getLocation());
        if (req.getMinSalary()       != null) job.setMinSalary(req.getMinSalary());
        if (req.getMaxSalary()       != null) job.setMaxSalary(req.getMaxSalary());
        if (req.getRequiredSkills()  != null) job.setRequiredSkills(req.getRequiredSkills());
        if (req.getExperienceYears() != null) job.setExperienceYears(req.getExperienceYears());
        if (req.getJobType()         != null) job.setJobType(req.getJobType());
        if (req.getDeadline()        != null) job.setDeadline(req.getDeadline());
        if (req.getActive()          != null) job.setActive(req.getActive());
    }
}
