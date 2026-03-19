package com.jobportal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ResumeStorageService {

    private final Path uploadRoot;
    private final long maxBytes;

    public ResumeStorageService(
            @Value("${app.resume.upload-dir}") String uploadDir,
            @Value("${app.resume.max-size-mb}") int maxSizeMb) throws IOException {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxBytes   = (long) maxSizeMb * 1024 * 1024;
        Files.createDirectories(this.uploadRoot);
    }

    /**
     * Validates, stores the file, and returns the relative stored path.
     */
    public String store(MultipartFile file) throws IOException {
        validatePdf(file);

        String filename = UUID.randomUUID() + ".pdf";
        Path target = uploadRoot.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return uploadRoot.getFileName() + "/" + filename;
    }

    /** Deletes a previously stored file. Silently ignores missing files. */
    public void delete(String storedPath) throws IOException {
        Path file = Paths.get(storedPath).toAbsolutePath().normalize();
        Files.deleteIfExists(file);
    }

    public Path resolve(String storedPath) {
        return Paths.get(storedPath).toAbsolutePath().normalize();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("File must not be empty");

        String contentType = file.getContentType();
        if (!"application/pdf".equals(contentType))
            throw new IllegalArgumentException("Only PDF files are accepted");

        if (file.getSize() > maxBytes)
            throw new IllegalArgumentException(
                "File exceeds maximum allowed size of " + (maxBytes / (1024 * 1024)) + " MB");
    }
}
