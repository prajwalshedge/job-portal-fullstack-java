package com.jobportal.repository;

import com.jobportal.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByApplicantId(Long applicantId);
    List<Application> findByJobId(Long jobId);
    boolean existsByJobIdAndApplicantId(Long jobId, Long applicantId);

    // Applications grouped by status for analytics
    @Query("SELECT a.status, COUNT(a) FROM Application a GROUP BY a.status")
    List<Object[]> countByStatus();

    // Applications per day for last N days
    @Query("SELECT CAST(a.appliedAt AS date), COUNT(a) FROM Application a " +
           "WHERE a.appliedAt >= :since GROUP BY CAST(a.appliedAt AS date) ORDER BY CAST(a.appliedAt AS date)")
    List<Object[]> countApplicationsPerDay(@Param("since") LocalDateTime since);
}
