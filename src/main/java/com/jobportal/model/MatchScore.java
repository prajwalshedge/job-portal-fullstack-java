package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "match_scores", indexes = {
    @Index(name = "idx_ms_job",   columnList = "job_id"),
    @Index(name = "idx_ms_score", columnList = "score")
})
public class MatchScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Overall weighted score 0–100 */
    @Column(nullable = false)
    private double score;

    /** Jaccard skill overlap component 0–100 */
    @Column(name = "skill_score")
    private double skillScore;

    /** Experience fit component 0–100 */
    @Column(name = "experience_score")
    private double experienceScore;

    /** Title keyword overlap component 0–100 */
    @Column(name = "title_score")
    private double titleScore;

    /** Skills present in both resume and job */
    @Column(name = "matched_skills", length = 2000)
    private String matchedSkills;

    /** Job skills absent from resume */
    @Column(name = "missing_skills", length = 2000)
    private String missingSkills;

    @Column(updatable = false)
    private LocalDateTime computedAt = LocalDateTime.now();
}
