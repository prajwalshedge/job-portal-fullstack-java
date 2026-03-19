package com.jobportal.repository;

import com.jobportal.model.MatchScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchScoreRepository extends JpaRepository<MatchScore, Long> {

    Optional<MatchScore> findByApplicationId(Long applicationId);

    Optional<MatchScore> findByJobIdAndUserId(Long jobId, Long userId);

    /** Returns all candidates for a job ranked highest score first */
    List<MatchScore> findByJobIdOrderByScoreDesc(Long jobId);
}
