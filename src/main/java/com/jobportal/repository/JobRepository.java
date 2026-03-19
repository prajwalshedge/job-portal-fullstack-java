package com.jobportal.repository;

import com.jobportal.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByActiveTrue();

    List<Job> findByPostedById(Long recruiterId);

    List<Job> findByTitleContainingIgnoreCaseAndActiveTrue(String keyword);

    // Search by required skills keyword
    @Query("SELECT j FROM Job j WHERE j.active = true AND LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<Job> findByRequiredSkillContaining(@Param("skill") String skill);
}
