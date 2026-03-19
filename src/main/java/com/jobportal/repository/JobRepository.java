package com.jobportal.repository;

import com.jobportal.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByActiveTrue();
    List<Job> findByPostedById(Long userId);
    List<Job> findByTitleContainingIgnoreCaseAndActiveTrue(String keyword);
}
