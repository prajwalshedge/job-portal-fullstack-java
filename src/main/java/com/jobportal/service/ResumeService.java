package com.jobportal.service;

import com.jobportal.dto.ResumeDto;
import com.jobportal.model.Resume;
import com.jobportal.model.User;
import com.jobportal.repository.ResumeRepository;
import com.jobportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository    resumeRepository;
    private final UserRepository      userRepository;
    private final ResumeStorageService storageService;
    private final PdfTextExtractor    pdfTextExtractor;
    private final SkillExtractorService skillExtractor;

    @Transactional
    public ResumeDto.ResumeResponse upload(MultipartFile file, String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete previous resume file + record if one exists
        resumeRepository.findByUserId(user.getId()).ifPresent(existing -> {
            try {
                storageService.delete(existing.getStoredPath());
            } catch (IOException ignored) {}
            resumeRepository.delete(existing);
        });

        // 1. Persist file to disk
        String storedPath = storageService.store(file);

        // 2. Extract raw text from PDF
        Path pdfPath = storageService.resolve(storedPath);
        String rawText = pdfTextExtractor.extract(pdfPath);

        // 3. Parse skills from raw text
        String skills = skillExtractor.extract(rawText);

        // 4. Persist Resume record
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setOriginalFilename(file.getOriginalFilename());
        resume.setStoredPath(storedPath);
        resume.setFileSizeBytes(file.getSize());
        resume.setExtractedText(rawText);
        resume.setExtractedSkills(skills);
        resumeRepository.save(resume);

        // 5. Update User.skills and resumeLink
        user.setSkills(skills);
        user.setResumeLink(storedPath);
        userRepository.save(user);

        return ResumeDto.ResumeResponse.from(resume);
    }

    public ResumeDto.ResumeResponse get(String email) {
        Resume resume = resumeRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("No resume uploaded yet"));
        return ResumeDto.ResumeResponse.from(resume);
    }

    @Transactional
    public void delete(String email) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No resume found"));

        storageService.delete(resume.getStoredPath());
        resumeRepository.delete(resume);

        // Clear skills and resume link from user profile
        user.setSkills(null);
        user.setResumeLink(null);
        userRepository.save(user);
    }
}
