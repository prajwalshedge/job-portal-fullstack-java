package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String company;

    private String location;
    private String salary;

    @Column(name = "required_skills", length = 500)
    private String requiredSkills;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Enumerated(EnumType.STRING)
    private JobType jobType = JobType.FULL_TIME;

    // ManyToOne — many jobs can be posted by one recruiter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private Recruiter postedBy;

    // OneToMany — one job can have many applications
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Application> applications = new ArrayList<>();

    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum JobType { FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE }
}
