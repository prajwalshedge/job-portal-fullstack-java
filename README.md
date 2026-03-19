# Job Portal - Full Stack Java

A Spring Boot REST API for a Job Portal application.

## Tech Stack
- Java 17, Spring Boot 3.2
- Spring Web, Spring Data JPA, Spring Security
- MySQL, JWT (jjwt), Lombok, Maven

## Project Structure
```
src/main/java/com/jobportal/
├── controller/       # REST controllers
├── service/          # Business logic
├── repository/       # JPA repositories
├── model/            # JPA entities
├── dto/              # Request/Response DTOs
├── security/         # JWT filter, UserDetailsService
└── config/           # SecurityConfig, GlobalExceptionHandler
```

## Setup

1. Create MySQL database:
```sql
CREATE DATABASE job_portal;
```

2. Update `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=your_password
app.jwt.secret=your-256-bit-secret
```

3. Run:
```bash
mvn spring-boot:run
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register (role: JOB_SEEKER/EMPLOYER) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/jobs` | Public | List all jobs (`?keyword=java`) |
| GET | `/api/jobs/{id}` | Public | Get job by ID |
| POST | `/api/jobs` | EMPLOYER | Post a job |
| DELETE | `/api/jobs/{id}` | EMPLOYER | Delete own job |
| POST | `/api/jobs/{id}/apply` | JOB_SEEKER | Apply to a job |
| GET | `/api/applications/my` | JOB_SEEKER | My applications |
| GET | `/api/jobs/{id}/applications` | EMPLOYER | Applications for a job |
| PATCH | `/api/applications/{id}/status` | EMPLOYER | Update application status |

## Authentication
Pass JWT in header: `Authorization: Bearer <token>`
