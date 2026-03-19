package com.jobportal.repository;

import com.jobportal.model.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {

    Optional<Recruiter> findByUserId(Long userId);

    Optional<Recruiter> findByUserEmail(String email);

    boolean existsByUserId(Long userId);
}
