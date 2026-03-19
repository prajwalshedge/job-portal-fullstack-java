package com.jobportal.repository;

import com.jobportal.model.Role;
import com.jobportal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Find all users that have a specific role
    List<User> findByRolesName(Role.RoleName roleName);

    // Search job seekers by skill keyword
    @Query("SELECT u FROM User u WHERE LOWER(u.skills) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<User> findBySkillContaining(@Param("skill") String skill);

    // Admin analytics — registrations per day for last N days
    @Query("SELECT CAST(u.createdAt AS date), COUNT(u) FROM User u " +
           "WHERE u.createdAt >= :since GROUP BY CAST(u.createdAt AS date) ORDER BY CAST(u.createdAt AS date)")
    List<Object[]> countRegistrationsPerDay(@Param("since") LocalDateTime since);

    long countByRolesName(Role.RoleName roleName);
}
