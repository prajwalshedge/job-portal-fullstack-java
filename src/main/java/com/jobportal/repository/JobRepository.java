package com.jobportal.repository;

import com.jobportal.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findByActiveTrue();

    List<Job> findByPostedByIdAndActiveTrue(Long recruiterId);

    List<Job> findByPostedById(Long recruiterId);

    long countByActiveTrue();

    // Jobs grouped by jobType for analytics
    @Query("SELECT j.jobType, COUNT(j) FROM Job j GROUP BY j.jobType")
    List<Object[]> countByJobType();
}
