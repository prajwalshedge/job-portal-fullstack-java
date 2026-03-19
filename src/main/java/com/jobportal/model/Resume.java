package com.jobportal.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    // Relative path on disk: uploads/resumes/<uuid>.pdf
    @Column(name = "stored_path", nullable = false)
    private String storedPath;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    // Raw text extracted from the PDF (stored for re-processing if needed)
    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;

    // Comma-separated skills parsed from extracted text
    @Column(name = "extracted_skills", length = 2000)
    private String extractedSkills;

    @Column(updatable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    // One user has one active resume (previous is replaced)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
}
