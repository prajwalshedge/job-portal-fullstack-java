# Job Portal — Full Stack Java + React

A production-grade full-stack Job Portal built with **Spring Boot** (backend) and **React + Vite** (frontend).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| Security | Spring Security, JWT (jjwt 0.11), BCrypt |
| Database | MySQL 8, Spring Data JPA, Hibernate |
| PDF Processing | Apache PDFBox 3.x |
| Email | Spring Mail, JavaMailSender (Gmail SMTP) |
| Build | Maven |
| Frontend | React 18, Vite |
| HTTP Client | Axios (with token refresh interceptor) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |

---

## Project Structure

```
job-portal-fullstack-java/
│
├── src/main/java/com/jobportal/
│   ├── config/
│   │   ├── CorsConfig.java              # CORS — allowed origins from application.properties
│   │   ├── EmailProperties.java         # @ConfigurationProperties for app.mail.*
│   │   ├── GlobalExceptionHandler.java  # Maps exceptions to HTTP responses
│   │   ├── ScoringWeights.java          # @ConfigurationProperties for app.matching.*
│   │   └── SecurityConfig.java          # JWT filter chain + role-based route rules
│   │
│   ├── controller/
│   │   ├── AdminController.java         # /api/admin/** — ADMIN only
│   │   ├── ApplicationController.java   # /api/jobs/{id}/apply, /api/applications/**
│   │   ├── AuthController.java          # /api/auth/register, login, refresh, me
│   │   ├── JobController.java           # /api/jobs/**
│   │   ├── MatchingController.java      # /api/match/**
│   │   └── ResumeController.java        # /api/resume/**
│   │
│   ├── dto/
│   │   ├── AdminDto.java                # AnalyticsResponse, UserAdminResponse, JobAdminResponse
│   │   ├── AuthDto.java                 # RegisterRequest, LoginRequest, AuthResponse, MeResponse
│   │   ├── JobDto.java                  # JobRequest, JobUpdateRequest, JobFilterRequest, JobResponse
│   │   ├── MatchDto.java                # CandidateRankResponse, JobMatchResponse
│   │   └── ResumeDto.java               # ResumeResponse
│   │
│   ├── model/
│   │   ├── Application.java             # ManyToOne → Job, User
│   │   ├── Job.java                     # ManyToOne → Recruiter, OneToMany → Application
│   │   ├── MatchScore.java              # OneToOne → Application, ManyToOne → Job, User
│   │   ├── Recruiter.java               # OneToOne → User, OneToMany → Job
│   │   ├── Resume.java                  # OneToOne → User
│   │   ├── Role.java                    # RoleName enum: USER, RECRUITER, ADMIN
│   │   └── User.java                    # ManyToMany → Role, OneToMany → Application
│   │
│   ├── repository/
│   │   ├── ApplicationRepository.java
│   │   ├── JobRepository.java           # + JpaSpecificationExecutor for filters
│   │   ├── JobSpecification.java        # Dynamic filter builder (keyword/location/salary/skill/type)
│   │   ├── MatchScoreRepository.java
│   │   ├── RecruiterRepository.java
│   │   ├── ResumeRepository.java
│   │   ├── RoleRepository.java
│   │   └── UserRepository.java
│   │
│   ├── security/
│   │   ├── JwtAuthFilter.java           # Reads role from JWT claim — no DB hit per request
│   │   ├── JwtUtil.java                 # Generate/validate access + refresh tokens
│   │   └── UserDetailsServiceImpl.java  # Loads authorities from Role entity
│   │
│   ├── service/
│   │   ├── AdminService.java            # Analytics aggregation, user/job management
│   │   ├── ApplicationService.java      # Apply, status update, triggers email + match score
│   │   ├── AuthService.java             # Register, login, token response
│   │   ├── EmailService.java            # @Async sends via JavaMailSender
│   │   ├── EmailTemplateBuilder.java    # Plain-text email subjects and bodies
│   │   ├── JobService.java              # CRUD + filter via Specification
│   │   ├── MatchingService.java         # Orchestrates scoring, persistence, ranked retrieval
│   │   ├── PdfTextExtractor.java        # PDFBox text extraction
│   │   ├── ResumeService.java           # Upload → extract → save skills → recompute scores
│   │   ├── ResumeStorageService.java    # Disk I/O, UUID filenames, PDF validation
│   │   ├── SkillExtractorService.java   # 70-skill dictionary, regex matching
│   │   └── SkillMatchEngine.java        # Weighted scoring: Jaccard + experience + title
│   │
│   └── JobPortalApplication.java        # @SpringBootApplication @EnableAsync
│
├── src/main/resources/
│   └── application.properties
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js                 # Axios instance + silent token refresh on 401
│   │   │   ├── admin.js
│   │   │   ├── applications.js
│   │   │   ├── auth.js
│   │   │   ├── jobs.js
│   │   │   ├── match.js
│   │   │   └── resume.js
│   │   ├── components/
│   │   │   ├── ApplyModal.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx       # Auth guard + guestOnly + role guard
│   │   ├── hooks/
│   │   │   └── useApi.js                # Shared loading/error/data wrapper
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx       # Stat cards, bar/pill charts, user/job tables
│   │   │   ├── JobDetailPage.jsx
│   │   │   ├── JobsPage.jsx             # Listing + filter bar
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx          # Resume upload, skills, applications + match scores
│   │   │   ├── RecruiterDashboard.jsx   # Post jobs, manage applicants, update status
│   │   │   └── RegisterPage.jsx
│   │   ├── store/
│   │   │   └── authStore.jsx            # React Context — user state, persisted in localStorage
│   │   └── App.jsx
│   ├── vite.config.js                   # Dev proxy: /api → http://localhost:8000
│   └── .env
│
└── pom.xml
```

---

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8+
- Node.js 18+

### 1. Clone

```bash
git clone https://github.com/prajwalshedge/job-portal-fullstack-java.git
cd job-portal-fullstack-java
```

### 2. Create the database

```sql
CREATE DATABASE job_portal;
```

### 3. Configure the backend

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=your_mysql_password

app.jwt.secret=your-32-char-minimum-secret-key-here

# Gmail App Password (https://myaccount.google.com/apppasswords)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
app.mail.from=your-email@gmail.com
```

### 4. Run the backend

```bash
mvn spring-boot:run
# API available at http://localhost:8000
```

### 5. Run the frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=/api (Vite proxy handles it)
npm install
npm run dev
# UI available at http://localhost:5173
```

---

## Configuration Reference

All configurable values in `application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/job_portal?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password

# JWT
app.jwt.secret=your-256-bit-secret-key-change-this-in-production
app.jwt.expiration-ms=900000          # 15 minutes
app.jwt.refresh-expiration-ms=604800000  # 7 days

# Resume upload
app.resume.upload-dir=uploads/resumes
app.resume.max-size-mb=5

# Match scoring weights (must sum to 1.0)
app.matching.skill-weight=0.60
app.matching.experience-weight=0.25
app.matching.title-weight=0.15
app.matching.experience-gap-penalty=0.10

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# CORS
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register — role: `USER` or `RECRUITER` |
| POST | `/api/auth/login` | Public | Login — returns `accessToken` + `refreshToken` |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Any | Current user profile |

### Jobs — `/api/jobs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | All active jobs |
| GET | `/api/jobs/{id}` | Public | Single job |
| GET | `/api/jobs/filter` | Public | Filter: `?keyword=&location=&minSalary=&maxSalary=&skill=&jobType=` |
| GET | `/api/jobs/my` | RECRUITER | Recruiter's own postings |
| POST | `/api/jobs` | RECRUITER | Create job |
| PUT | `/api/jobs/{id}` | RECRUITER | Update own job (patch-style) |
| DELETE | `/api/jobs/{id}` | RECRUITER | Delete own job |

### Applications — `/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/jobs/{id}/apply` | USER | Apply to a job |
| GET | `/api/applications/my` | USER | My applications |
| GET | `/api/jobs/{id}/applications` | RECRUITER | Applicants for a job |
| PATCH | `/api/applications/{id}/status` | RECRUITER | Update status — triggers email |

### Resume — `/api/resume`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/resume/upload` | USER | Upload PDF (multipart, max 5 MB) |
| GET | `/api/resume` | USER | Resume info + extracted skills |
| DELETE | `/api/resume` | USER | Delete resume + clear skills |

### Match Scoring — `/api/match`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/match/job/{id}/candidates` | RECRUITER | Ranked applicants by match score |
| GET | `/api/match/job/{id}/my-score` | USER | Own match score for a job |
| POST | `/api/match/job/{id}/recompute` | RECRUITER | Recompute all scores for a job |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/analytics` | ADMIN | Totals + chart data (last 30 days) |
| GET | `/api/admin/users` | ADMIN | All users |
| DELETE | `/api/admin/users/{id}` | ADMIN | Delete user |
| GET | `/api/admin/jobs` | ADMIN | All jobs |
| DELETE | `/api/admin/jobs/{id}` | ADMIN | Delete job |

---

## Features

### Authentication
- JWT access tokens (15 min) + refresh tokens (7 days)
- Role claim embedded in JWT — no DB hit on every request
- Silent token refresh in Axios interceptor — user never sees a logout on expiry
- BCrypt password hashing
- Roles: `USER` (job seeker), `RECRUITER`, `ADMIN`

### Job Module
- Full CRUD for recruiters
- Dynamic multi-filter search (keyword, location, salary range, skill, job type)
- `JpaSpecificationExecutor` — any combination of filters in one query

### Resume Module
- PDF upload (validated by content-type + size)
- Apache PDFBox text extraction
- 70-skill dictionary with regex matching → auto-populates `User.skills`
- Re-uploading replaces old file and recomputes all match scores

### Resume–Job Matching
- Three weighted components:
  - **Skill overlap** — Jaccard similarity on skill sets (60%)
  - **Experience fit** — linear decay per missing year (25%)
  - **Title keyword overlap** — job title words found in resume text (15%)
- Weights tunable from `application.properties` without recompiling
- Score persisted in `match_scores` table — queryable and sortable
- Verdict labels: `EXCELLENT` (≥75) / `GOOD` (≥50) / `FAIR` (≥25) / `LOW`

### Email Notifications
- `@Async` — never blocks the main request thread
- On application submit: confirmation to applicant + new-applicant alert to recruiter
- On status update: contextual message to applicant per status (SHORTLISTED, REJECTED, HIRED…)
- Failures logged and swallowed — email never breaks the main transaction

### Admin Dashboard
- Analytics: 6 stat cards + bar charts (registrations/day, applications/day) + pill charts (by status, by job type)
- User management table with search + delete
- Job management table with search + delete

### Frontend
- React 18 + Vite + Tailwind CSS
- Vite dev proxy — no CORS issues in development
- `ProtectedRoute` with `guestOnly` and `role` guards
- `useApi` hook — shared loading/error/data state
- Pages: Login, Register, Jobs listing, Job detail, Profile (resume + applications), Recruiter Dashboard, Admin Dashboard

---

## Roles & Access

| Feature | USER | RECRUITER | ADMIN |
|---|---|---|---|
| Browse jobs | ✅ | ✅ | ✅ |
| Apply to job | ✅ | — | — |
| Upload resume | ✅ | — | — |
| View match score | ✅ | — | — |
| Post / edit jobs | — | ✅ | ✅ |
| View applicants | — | ✅ | ✅ |
| Update app status | — | ✅ | ✅ |
| Admin dashboard | — | — | ✅ |
| Delete any user/job | — | — | ✅ |

---

## Creating an Admin Account

There is no public register endpoint for `ADMIN`. Insert directly into the database after registering a normal account:

```sql
-- 1. Insert the ADMIN role if it doesn't exist
INSERT IGNORE INTO roles (name) VALUES ('ADMIN');

-- 2. Assign it to a user (replace 1 with the actual user ID)
INSERT INTO user_roles (user_id, role_id)
SELECT 1, id FROM roles WHERE name = 'ADMIN';
```

---

## License

MIT
