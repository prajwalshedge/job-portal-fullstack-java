package com.jobportal.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class SkillExtractorService {

    // Curated dictionary — extend freely
    private static final List<String> SKILL_DICTIONARY = List.of(
        // Languages
        "Java", "Python", "JavaScript", "TypeScript", "Kotlin", "Scala",
        "C", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "R",
        // Web / Frontend
        "HTML", "CSS", "React", "Angular", "Vue", "Next.js", "Tailwind",
        "Bootstrap", "jQuery", "Redux",
        // Backend / Frameworks
        "Spring", "Spring Boot", "Spring Security", "Spring MVC",
        "Hibernate", "JPA", "Node.js", "Express", "Django", "Flask",
        "FastAPI", "Laravel", "Rails",
        // Databases
        "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra",
        "Oracle", "SQL Server", "SQLite", "Elasticsearch",
        // Cloud / DevOps
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
        "Jenkins", "GitHub Actions", "CI/CD", "Linux", "Nginx",
        // Data / ML
        "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
        "Pandas", "NumPy", "Scikit-learn", "Spark", "Kafka", "Hadoop",
        // Tools / Practices
        "Git", "Maven", "Gradle", "REST", "GraphQL", "Microservices",
        "Agile", "Scrum", "JUnit", "Mockito", "Selenium"
    );

    /**
     * Scans the raw PDF text for known skills (case-insensitive, whole-word match).
     * Returns a comma-separated string of matched skills in dictionary order.
     */
    public String extract(String rawText) {
        if (rawText == null || rawText.isBlank()) return "";

        Set<String> found = new LinkedHashSet<>();
        for (String skill : SKILL_DICTIONARY) {
            // \b doesn't work well with dots (e.g. "Node.js"), so use lookaround
            String regex = "(?i)(?<![\\w.])" + Pattern.quote(skill) + "(?![\\w.])";
            if (Pattern.compile(regex).matcher(rawText).find()) {
                found.add(skill);
            }
        }
        return String.join(",", found);
    }
}
