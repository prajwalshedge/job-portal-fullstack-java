package com.jobportal.repository;

import com.jobportal.model.Job;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    private JobSpecification() {}

    /**
     * Builds a Specification from optional filter values.
     * Every null parameter is simply ignored — only non-null values are added as predicates.
     */
    public static Specification<Job> withFilters(
            String keyword,
            String location,
            Integer minSalary,
            Integer maxSalary,
            String skill,
            Job.JobType jobType,
            Boolean active
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (active != null)
                predicates.add(cb.equal(root.get("active"), active));

            if (keyword != null && !keyword.isBlank())
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")),       "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("company")),     "%" + keyword.toLowerCase() + "%")
                ));

            if (location != null && !location.isBlank())
                predicates.add(cb.like(cb.lower(root.get("location")),
                        "%" + location.toLowerCase() + "%"));

            if (minSalary != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("minSalary"), minSalary));

            if (maxSalary != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("maxSalary"), maxSalary));

            if (skill != null && !skill.isBlank())
                predicates.add(cb.like(cb.lower(root.get("requiredSkills")),
                        "%" + skill.toLowerCase() + "%"));

            if (jobType != null)
                predicates.add(cb.equal(root.get("jobType"), jobType));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
