package com.jobportal.repository;

import com.jobportal.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    Optional<Resume> findByUserId(Long userId);

    Optional<Resume> findByUserEmail(String email);

    boolean existsByUserId(Long userId);
}
