package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "recruiters")
public class Recruiter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String company;

    @Column(length = 100)
    private String designation;

    @Column(length = 20)
    private String companyPhone;

    @Column(name = "company_website")
    private String companyWebsite;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;

    // One User account can have one Recruiter profile
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // All jobs posted by this recruiter
    @OneToMany(mappedBy = "postedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Job> postedJobs = new ArrayList<>();
}
