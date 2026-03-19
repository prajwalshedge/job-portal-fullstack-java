package com.jobportal.service;

import com.jobportal.dto.AuthDto;
import com.jobportal.model.Recruiter;
import com.jobportal.model.Role;
import com.jobportal.model.User;
import com.jobportal.repository.RecruiterRepository;
import com.jobportal.repository.RoleRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository     userRepository;
    private final RoleRepository     roleRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        Role.RoleName roleName;
        try {
            roleName = Role.RoleName.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.getRoles().add(role);
        userRepository.save(user);

        // Auto-create an empty Recruiter profile for RECRUITER accounts
        if (roleName == Role.RoleName.RECRUITER) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(user);
            recruiter.setCompany("—");          // placeholder until profile is updated
            recruiterRepository.save(recruiter);
        }

        return toAuthResponse(user);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return toAuthResponse(user);
    }

    public AuthDto.MeResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new AuthDto.MeResponse(user);
    }

    private AuthDto.AuthResponse toAuthResponse(User user) {
        return new AuthDto.AuthResponse(
                jwtUtil.generateToken(user),
                jwtUtil.generateRefreshToken(user),
                user);
    }
}
