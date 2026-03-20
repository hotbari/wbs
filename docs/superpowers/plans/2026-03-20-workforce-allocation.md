# Workforce Allocation System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack internal workforce allocation platform with employee directory, skill tracking, and project assignment management.

**Architecture:** Next.js 14 frontend (App Router, TypeScript) calls a stateless Spring Boot 3.x / Kotlin REST API backed by PostgreSQL. Auth uses username/password with JWT access tokens (HttpOnly cookie for refresh tokens). Role-based access: EMPLOYEE (self-edit) and ADMIN (full control).

**Tech Stack:** Kotlin 1.9 + Spring Boot 3.x + JDK 17 + PostgreSQL + Flyway | Next.js 14 + TypeScript + TanStack Query + Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-20-workforce-allocation-design.md`

---

## File Structure

### Backend (`backend/`)
```
backend/
├── build.gradle.kts
├── settings.gradle.kts
├── src/main/kotlin/com/company/workforce/
│   ├── WorkforceApplication.kt
│   ├── config/
│   │   ├── SecurityConfig.kt          # Spring Security filter chain, CORS, CSRF off
│   │   └── JwtConfig.kt               # JWT secret + expiry properties
│   ├── domain/
│   │   ├── user/
│   │   │   ├── User.kt                # @Entity: id, email, passwordHash, role, employeeId, isActive
│   │   │   ├── UserRepository.kt      # findByEmail, findByEmployeeId
│   │   │   └── UserRole.kt            # enum: ADMIN, EMPLOYEE
│   │   ├── employee/
│   │   │   ├── Employee.kt            # @Entity: all profile fields + isActive
│   │   │   ├── EmployeeRepository.kt  # search, filter, available query
│   │   │   └── EmploymentType.kt      # enum: FULL_TIME, CONTRACT, PART_TIME
│   │   ├── skill/
│   │   │   ├── Skill.kt               # @Entity: id, name, category, description
│   │   │   ├── SkillRepository.kt     # findByCategory, existsByName
│   │   │   ├── EmployeeSkill.kt       # @Entity: employeeId, skillId, proficiency, certified, note
│   │   │   ├── EmployeeSkillRepository.kt
│   │   │   └── Proficiency.kt         # enum: BEGINNER, INTERMEDIATE, EXPERT
│   │   ├── allocation/
│   │   │   ├── ProjectAssignment.kt   # @Entity: all allocation fields
│   │   │   └── ProjectAssignmentRepository.kt  # sumActiveAllocation, findOverlapping
│   │   └── auth/
│   │       ├── RefreshToken.kt        # @Entity: userId, tokenHash, expiresAt, revoked
│   │       └── RefreshTokenRepository.kt  # findByTokenHash, revokeAllByUserId
│   ├── api/
│   │   ├── auth/
│   │   │   ├── AuthController.kt      # POST /api/auth/{login,refresh,logout}
│   │   │   ├── AuthService.kt         # login, refresh, logout, reuse detection
│   │   │   └── dto/
│   │   │       ├── LoginRequest.kt
│   │   │       └── LoginResponse.kt
│   │   ├── employee/
│   │   │   ├── EmployeeController.kt  # GET/POST/PATCH/DELETE /api/employees
│   │   │   ├── EmployeeService.kt     # CRUD + soft-delete + availability query
│   │   │   └── dto/
│   │   │       ├── CreateEmployeeRequest.kt
│   │   │       ├── UpdateEmployeeRequest.kt
│   │   │       ├── EmployeeSummary.kt
│   │   │       └── EmployeeDetail.kt
│   │   ├── skill/
│   │   │   ├── SkillController.kt     # /api/skills + /api/employees/{id}/skills
│   │   │   ├── SkillService.kt
│   │   │   └── dto/
│   │   │       ├── CreateSkillRequest.kt
│   │   │       ├── SkillResponse.kt
│   │   │       └── EmployeeSkillRequest.kt
│   │   ├── allocation/
│   │   │   ├── AllocationController.kt  # /api/allocations + /api/employees/{id}/allocations
│   │   │   ├── AllocationService.kt     # cap enforcement with SERIALIZABLE + FOR UPDATE
│   │   │   └── dto/
│   │   │       ├── CreateAllocationRequest.kt
│   │   │       ├── UpdateAllocationRequest.kt
│   │   │       └── AllocationResponse.kt
│   │   ├── admin/
│   │   │   ├── AdminController.kt     # GET /api/admin/dashboard
│   │   │   └── AdminService.kt        # aggregates dashboard metrics
│   │   └── common/
│   │       ├── PageResponse.kt        # generic { data, page, pageSize, total }
│   │       ├── ErrorResponse.kt       # { errors: [{field, message}] }
│   │       └── GlobalExceptionHandler.kt  # maps exceptions → HTTP responses
│   ├── security/
│   │   ├── JwtTokenProvider.kt        # issue + validate JWT access tokens
│   │   ├── JwtAuthenticationFilter.kt # extract JWT from header, set SecurityContext
│   │   └── UserDetailsServiceImpl.kt  # load user by email for Spring Security
│   └── resources/
│       ├── application.yml
│       └── db/migration/
│           ├── V1__create_users.sql
│           ├── V2__create_employees.sql
│           ├── V3__create_skills.sql
│           ├── V4__create_employee_skills.sql
│           ├── V5__create_project_assignments.sql
│           └── V6__create_refresh_tokens.sql
└── src/test/kotlin/com/company/workforce/
    ├── TestWorkforceApplication.kt     # Testcontainers config
    ├── api/auth/AuthControllerTest.kt
    ├── api/employee/EmployeeControllerTest.kt
    ├── api/skill/SkillControllerTest.kt
    ├── api/allocation/AllocationControllerTest.kt
    └── api/admin/AdminControllerTest.kt
```

### Frontend (`frontend/`)
```
frontend/
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── src/
    ├── middleware.ts                   # protect routes: redirect unauthenticated → /login
    ├── app/
    │   ├── layout.tsx                 # root layout: QueryClientProvider, NavBar
    │   ├── page.tsx                   # redirect → /employees
    │   ├── login/page.tsx
    │   ├── dashboard/page.tsx         # ADMIN only
    │   ├── employees/
    │   │   ├── page.tsx               # directory list
    │   │   └── [id]/
    │   │       ├── page.tsx           # employee detail
    │   │       └── edit/page.tsx      # self-edit (own user)
    │   └── admin/
    │       ├── employees/
    │       │   ├── new/page.tsx
    │       │   └── [id]/edit/page.tsx
    │       ├── allocations/page.tsx
    │       └── skills/page.tsx
    ├── components/
    │   ├── ui/
    │   │   ├── EmployeeCard.tsx
    │   │   ├── SkillBadge.tsx
    │   │   ├── AllocationBar.tsx
    │   │   ├── AvailabilityFilter.tsx
    │   │   └── Pagination.tsx
    │   ├── guards/
    │   │   └── AdminGuard.tsx         # redirect non-admins
    │   ├── forms/
    │   │   ├── LoginForm.tsx
    │   │   ├── EmployeeForm.tsx       # used by new + edit pages
    │   │   ├── SkillForm.tsx
    │   │   └── AllocationForm.tsx
    │   └── layout/
    │       └── NavBar.tsx
    ├── lib/
    │   ├── api/
    │   │   ├── client.ts              # fetch wrapper: base URL, auth header, error handling
    │   │   ├── auth.ts                # login, refresh, logout API calls
    │   │   ├── employees.ts           # employees CRUD + available
    │   │   ├── skills.ts              # skills + employee-skills
    │   │   └── allocations.ts         # allocations CRUD
    │   ├── hooks/
    │   │   ├── useAuth.ts             # auth state, login/logout actions
    │   │   ├── useEmployees.ts        # TanStack Query hooks
    │   │   ├── useSkills.ts
    │   │   └── useAllocations.ts
    │   └── types/
    │       └── index.ts               # all shared TypeScript types
    └── store/
        └── auth.ts                    # auth state (localStorage for access token)
```

---

## Task 1: Backend Project Setup

**Files:**
- Create: `backend/build.gradle.kts`
- Create: `backend/settings.gradle.kts`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/main/kotlin/com/company/workforce/WorkforceApplication.kt`

- [ ] **Step 1: Create Gradle build file**

```kotlin
// backend/build.gradle.kts
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.2.3"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "1.9.22"
    kotlin("plugin.spring") version "1.9.22"
    kotlin("plugin.jpa") version "1.9.22"
}

group = "com.company"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.flywaydb:flyway-core")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("io.jsonwebtoken:jjwt-api:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.5")
    runtimeOnly("org.postgresql:postgresql")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
}

tasks.withType<KotlinCompile> {
    kotlinOptions { freeCompilerArgs = listOf("-Xjsr305=strict"); jvmTarget = "17" }
}
tasks.withType<Test> { useJUnitPlatform() }
```

- [ ] **Step 2: Create settings.gradle.kts**

```kotlin
// backend/settings.gradle.kts
rootProject.name = "workforce"
```

- [ ] **Step 3: Create application.yml**

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/workforce}
    username: ${DB_USER:workforce}
    password: ${DB_PASS:workforce}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true

jwt:
  secret: ${JWT_SECRET:change-me-in-production-must-be-256-bits-long}
  access-token-expiry-ms: 900000       # 15 minutes
  refresh-token-expiry-days: 7

cors:
  allowed-origin: ${CORS_ALLOWED_ORIGIN:http://localhost:3000}

server:
  port: 8080
```

- [ ] **Step 4: Create main application class**

```kotlin
// backend/src/main/kotlin/com/company/workforce/WorkforceApplication.kt
package com.company.workforce

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class WorkforceApplication

fun main(args: Array<String>) {
    runApplication<WorkforceApplication>(*args)
}
```

- [ ] **Step 5: Start a local PostgreSQL instance and verify the app starts**

```bash
docker run -d --name workforce-db \
  -e POSTGRES_DB=workforce \
  -e POSTGRES_USER=workforce \
  -e POSTGRES_PASSWORD=workforce \
  -p 5432:5432 postgres:16
cd backend && ./gradlew bootRun
```
Expected: Application starts on port 8080 (Flyway will fail — no migrations yet, that's fine)

---

## Task 2: Database Migrations

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__create_users.sql` through `V6__create_refresh_tokens.sql`

- [ ] **Step 1: V1 — users table**

```sql
-- V1__create_users.sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    employee_id UUID NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 2: V2 — employees table**

```sql
-- V2__create_employees.sql
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'CONTRACT', 'PART_TIME');

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100) NOT NULL,
    team VARCHAR(100),
    job_title VARCHAR(100) NOT NULL,
    grade VARCHAR(50),
    employment_type employment_type NOT NULL,
    hired_at DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE users
    ADD CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees(id);
```

- [ ] **Step 3: V3 — skills table**

```sql
-- V3__create_skills.sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT
);
```

- [ ] **Step 4: V4 — employee_skills table**

```sql
-- V4__create_employee_skills.sql
CREATE TYPE proficiency_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

CREATE TABLE employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    proficiency proficiency_level NOT NULL,
    certified BOOLEAN NOT NULL DEFAULT FALSE,
    note TEXT,
    UNIQUE (employee_id, skill_id)
);
```

- [ ] **Step 5: V5 — project_assignments table**

```sql
-- V5__create_project_assignments.sql
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    project_name VARCHAR(255) NOT NULL,
    role_in_project VARCHAR(100) NOT NULL,
    allocation_percent INTEGER NOT NULL CHECK (allocation_percent BETWEEN 1 AND 100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_end_after_start CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE INDEX idx_assignments_employee ON project_assignments(employee_id);
CREATE INDEX idx_assignments_active ON project_assignments(employee_id, is_active);
```

- [ ] **Step 6: V6 — refresh_tokens table**

```sql
-- V6__create_refresh_tokens.sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

- [ ] **Step 7: Run migrations**

```bash
cd backend && ./gradlew bootRun
```
Expected: Flyway applies V1–V6, app starts cleanly. Verify in psql:
```sql
\dt  -- should show 6 tables
```

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat: backend project setup and database migrations"
```

---

## Task 3: Domain Entities and Repositories

**Files:**
- Create: all `domain/` files listed in file structure above

- [ ] **Step 1: Enums**

```kotlin
// domain/user/UserRole.kt
package com.company.workforce.domain.user
enum class UserRole { ADMIN, EMPLOYEE }

// domain/employee/EmploymentType.kt
package com.company.workforce.domain.employee
enum class EmploymentType { FULL_TIME, CONTRACT, PART_TIME }

// domain/skill/Proficiency.kt
package com.company.workforce.domain.skill
enum class Proficiency { BEGINNER, INTERMEDIATE, EXPERT }
```

- [ ] **Step 2: Employee entity**

```kotlin
// domain/employee/Employee.kt
package com.company.workforce.domain.employee

import jakarta.persistence.*
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "employees")
class Employee(
    @Id val id: UUID = UUID.randomUUID(),
    var fullName: String,
    var email: String,
    var phone: String? = null,
    var department: String,
    var team: String? = null,
    var jobTitle: String,
    var grade: String? = null,
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "employment_type")
    var employmentType: EmploymentType,
    var hiredAt: LocalDate,
    var isActive: Boolean = true
)
```

- [ ] **Step 3: Employee repository**

```kotlin
// domain/employee/EmployeeRepository.kt
package com.company.workforce.domain.employee

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface EmployeeRepository : JpaRepository<Employee, UUID> {

    @Query("""
        SELECT e FROM Employee e WHERE e.isActive = true
        AND (:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:department IS NULL OR e.department = :department)
        AND (:employmentType IS NULL OR e.employmentType = :employmentType)
    """)
    fun search(
        search: String?,
        department: String?,
        employmentType: EmploymentType?,
        pageable: Pageable
    ): Page<Employee>
}
```

- [ ] **Step 4: User entity**

```kotlin
// domain/user/User.kt
package com.company.workforce.domain.user

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id val id: UUID = UUID.randomUUID(),
    var email: String,
    var passwordHash: String,
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "user_role")
    var role: UserRole,
    var employeeId: UUID,
    var isActive: Boolean = true,
    val createdAt: Instant = Instant.now()
)
```

- [ ] **Step 5: User repository**

```kotlin
// domain/user/UserRepository.kt
package com.company.workforce.domain.user

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
    fun findByEmployeeId(employeeId: UUID): User?
}
```

- [ ] **Step 6: Skill + EmployeeSkill entities**

```kotlin
// domain/skill/Skill.kt
package com.company.workforce.domain.skill

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "skills")
class Skill(
    @Id val id: UUID = UUID.randomUUID(),
    var name: String,
    var category: String,
    var description: String? = null
)

// domain/skill/EmployeeSkill.kt
@Entity
@Table(name = "employee_skills")
class EmployeeSkill(
    @Id val id: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    val skillId: UUID,
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "proficiency_level")
    var proficiency: Proficiency,
    var certified: Boolean = false,
    var note: String? = null
)
```

- [ ] **Step 7: Skill repositories**

```kotlin
// domain/skill/SkillRepository.kt
interface SkillRepository : JpaRepository<Skill, UUID> {
    fun findByCategory(category: String): List<Skill>
    fun existsByName(name: String): Boolean
    fun existsByNameAndIdNot(name: String, id: UUID): Boolean
}

// domain/skill/EmployeeSkillRepository.kt
interface EmployeeSkillRepository : JpaRepository<EmployeeSkill, UUID> {
    fun findByEmployeeId(employeeId: UUID): List<EmployeeSkill>
    fun findByEmployeeIdAndSkillId(employeeId: UUID, skillId: UUID): EmployeeSkill?
    fun existsByEmployeeIdAndSkillId(employeeId: UUID, skillId: UUID): Boolean
    fun existsBySkillId(skillId: UUID): Boolean
}
```

- [ ] **Step 8: ProjectAssignment entity + repository**

```kotlin
// domain/allocation/ProjectAssignment.kt
@Entity
@Table(name = "project_assignments")
class ProjectAssignment(
    @Id val id: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    var projectName: String,
    var roleInProject: String,
    var allocationPercent: Int,
    var startDate: LocalDate,
    var endDate: LocalDate? = null,
    var isActive: Boolean = true
)

// domain/allocation/ProjectAssignmentRepository.kt
interface ProjectAssignmentRepository : JpaRepository<ProjectAssignment, UUID> {

    fun findByEmployeeId(employeeId: UUID): List<ProjectAssignment>

    @Query("""
        SELECT COALESCE(SUM(pa.allocationPercent), 0)
        FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId
          AND pa.isActive = true
          AND pa.id <> :excludeId
          AND pa.startDate <= CURRENT_DATE
          AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
    """)
    fun sumTodayAllocation(employeeId: UUID, excludeId: UUID): Int

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT pa FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId AND pa.isActive = true
    """)
    fun findActiveForUpdateLock(employeeId: UUID): List<ProjectAssignment>
}
```

- [ ] **Step 9: RefreshToken entity + repository**

```kotlin
// domain/auth/RefreshToken.kt
@Entity
@Table(name = "refresh_tokens")
class RefreshToken(
    @Id val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    var tokenHash: String,
    val expiresAt: Instant,
    var revoked: Boolean = false,
    val createdAt: Instant = Instant.now()
)

// domain/auth/RefreshTokenRepository.kt
interface RefreshTokenRepository : JpaRepository<RefreshToken, UUID> {
    fun findByTokenHash(tokenHash: String): RefreshToken?

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.userId = :userId")
    fun revokeAllByUserId(userId: UUID): Int
}
```

- [ ] **Step 10: Commit**

```bash
git add backend/src/main/kotlin/
git commit -m "feat: domain entities and repositories"
```

---

## Task 4: Security Infrastructure

**Files:**
- Create: `security/JwtTokenProvider.kt`
- Create: `security/JwtAuthenticationFilter.kt`
- Create: `security/UserDetailsServiceImpl.kt`
- Create: `config/SecurityConfig.kt`
- Create: `config/JwtConfig.kt`

- [ ] **Step 1: Write the failing test for JwtTokenProvider**

```kotlin
// src/test/kotlin/.../security/JwtTokenProviderTest.kt
class JwtTokenProviderTest {
    private val secret = "test-secret-key-must-be-at-least-256-bits-long!!"
    private val provider = JwtTokenProvider(secret, expiryMs = 900_000L)

    @Test
    fun `generates token and extracts email`() {
        val token = provider.generateToken("alice@example.com", UUID.randomUUID())
        assertThat(provider.extractEmail(token)).isEqualTo("alice@example.com")
    }

    @Test
    fun `isValid returns false for tampered token`() {
        val token = provider.generateToken("alice@example.com", UUID.randomUUID())
        assertThat(provider.isValid(token + "x")).isFalse()
    }
}
```

Run: `./gradlew test --tests "*.JwtTokenProviderTest"` → Expected: FAIL (class not found)

- [ ] **Step 2: JwtConfig**

```kotlin
// config/JwtConfig.kt
@ConfigurationProperties(prefix = "jwt")
@Component
data class JwtConfig(
    val secret: String,
    val accessTokenExpiryMs: Long,
    val refreshTokenExpiryDays: Long
)
```

- [ ] **Step 3: JwtTokenProvider**

```kotlin
// security/JwtTokenProvider.kt
@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.access-token-expiry-ms}") private val expiryMs: Long
) {
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray(Charsets.UTF_8))
    }

    fun generateToken(email: String, userId: UUID): String =
        Jwts.builder()
            .subject(email)
            .claim("userId", userId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expiryMs))
            .signWith(key)
            .compact()

    fun extractEmail(token: String): String =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload.subject

    fun isValid(token: String): Boolean = runCatching { extractEmail(token) }.isSuccess
}
```

Run: `./gradlew test --tests "*.JwtTokenProviderTest"` → Expected: PASS

- [ ] **Step 4: UserDetailsServiceImpl**

```kotlin
// security/UserDetailsServiceImpl.kt
@Service
class UserDetailsServiceImpl(private val userRepository: UserRepository) : UserDetailsService {
    override fun loadUserByUsername(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            ?: throw UsernameNotFoundException("User not found: $email")
        return User.builder()
            .username(user.email)
            .password(user.passwordHash)
            .roles(user.role.name)
            .disabled(!user.isActive)
            .build()
    }
}
```

- [ ] **Step 5: JwtAuthenticationFilter**

```kotlin
// security/JwtAuthenticationFilter.kt
@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider,
    private val userDetailsService: UserDetailsServiceImpl
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain
    ) {
        val token = request.getHeader("Authorization")
            ?.takeIf { it.startsWith("Bearer ") }
            ?.substring(7)

        if (token != null && jwtTokenProvider.isValid(token)) {
            val email = jwtTokenProvider.extractEmail(token)
            val userDetails = userDetailsService.loadUserByUsername(email)
            val auth = UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.authorities
            )
            SecurityContextHolder.getContext().authentication = auth
        }
        chain.doFilter(request, response)
    }
}
```

- [ ] **Step 6: SecurityConfig**

```kotlin
// config/SecurityConfig.kt
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthFilter: JwtAuthenticationFilter,
    @Value("\${cors.allowed-origin}") private val allowedOrigin: String
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain = http
        .csrf { it.disable() }
        .cors { it.configurationSource(corsSource()) }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .authorizeHttpRequests {
            it.requestMatchers("/api/auth/**").permitAll()
              .anyRequest().authenticated()
        }
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
        .build()

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun corsSource() = UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/**", CorsConfiguration().apply {
            allowedOrigins = listOf(allowedOrigin)
            allowedMethods = listOf("GET", "POST", "PATCH", "DELETE", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
        })
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/
git commit -m "feat: JWT security infrastructure"
```

---

## Task 5: Auth API

**Files:**
- Create: `api/auth/AuthController.kt`
- Create: `api/auth/AuthService.kt`
- Create: `api/auth/dto/LoginRequest.kt`, `LoginResponse.kt`
- Create: `api/common/ErrorResponse.kt`, `GlobalExceptionHandler.kt`
- Create: `TestWorkforceApplication.kt` (Testcontainers base)

- [ ] **Step 1: Write failing auth integration test**

```kotlin
// TestWorkforceApplication.kt
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
abstract class IntegrationTestBase {
    companion object {
        @Container
        @JvmStatic
        val postgres = PostgreSQLContainer<Nothing>("postgres:16").apply {
            withDatabaseName("workforce_test")
            withUsername("test"); withPassword("test")
        }

        @JvmStatic
        @DynamicPropertySource
        fun props(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
        }
    }
}

// api/auth/AuthControllerTest.kt
@AutoConfigureMockMvc
class AuthControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder

    @BeforeEach
    fun setup() {
        // seed one employee + user
        val emp = employeeRepository.save(Employee(
            fullName = "Alice", email = "alice@test.com", department = "Eng",
            jobTitle = "Engineer", employmentType = EmploymentType.FULL_TIME,
            hiredAt = LocalDate.of(2023, 1, 1)
        ))
        userRepository.save(User(
            email = "alice@test.com",
            passwordHash = passwordEncoder.encode("Password1"),
            role = UserRole.EMPLOYEE, employeeId = emp.id
        ))
    }

    @Test
    fun `login with valid credentials returns access token`() {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("email" to "alice@test.com", "password" to "Password1")
            )
        }.andExpect { status { isOk() } }
         .andReturn().response
        val body = objectMapper.readTree(resp.contentAsString)
        assertThat(body["accessToken"].asText()).isNotBlank()
        assertThat(resp.getCookie("refreshToken")).isNotNull()
    }

    @Test
    fun `login with wrong password returns 401`() {
        mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("email" to "alice@test.com", "password" to "wrong")
            )
        }.andExpect { status { isUnauthorized() } }
    }
}
```

Run: `./gradlew test --tests "*.AuthControllerTest"` → Expected: FAIL (no controller)

- [ ] **Step 2: DTOs**

```kotlin
// api/auth/dto/LoginRequest.kt
data class LoginRequest(
    @field:Email val email: String,
    @field:NotBlank val password: String
)

// api/auth/dto/LoginResponse.kt
data class LoginResponse(
    val accessToken: String,
    val user: UserDto
)
data class UserDto(val id: UUID, val email: String, val role: String, val employeeId: UUID)
```

- [ ] **Step 3: AuthService**

```kotlin
// api/auth/AuthService.kt
@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val jwtConfig: JwtConfig
) {
    fun login(request: LoginRequest): Pair<LoginResponse, String> {
        val user = userRepository.findByEmail(request.email)
            ?: throw UnauthorizedException("Invalid credentials")
        if (!user.isActive) throw ForbiddenException("Account deactivated")
        if (!passwordEncoder.matches(request.password, user.passwordHash))
            throw UnauthorizedException("Invalid credentials")

        val accessToken = jwtTokenProvider.generateToken(user.email, user.id)
        val rawRefresh = UUID.randomUUID().toString()
        refreshTokenRepository.save(RefreshToken(
            userId = user.id,
            tokenHash = passwordEncoder.encode(rawRefresh),
            expiresAt = Instant.now().plus(jwtConfig.refreshTokenExpiryDays, ChronoUnit.DAYS)
        ))
        val response = LoginResponse(accessToken, UserDto(user.id, user.email, user.role.name, user.employeeId))
        return response to rawRefresh
    }

    fun refresh(rawToken: String): String {
        // Find token by checking all non-revoked, non-expired tokens for hash match
        // Find the matching token among ALL tokens for ALL users (keyed by userId is not possible
        // without the raw token, so we search all non-expired tokens per userId).
        // Strategy: query all tokens for the given userId by searching all active tokens,
        // match by bcrypt. To avoid full-table scan in production, add index on (user_id, revoked).
        val allTokens = refreshTokenRepository.findAll()
            .filter { it.expiresAt.isAfter(Instant.now()) }

        val matched = allTokens.firstOrNull { passwordEncoder.matches(rawToken, it.tokenHash) }

        if (matched == null) throw UnauthorizedException("Invalid or expired refresh token")

        // REUSE DETECTION: if the matched token is already revoked, someone is replaying
        // a rotated token — this indicates theft. Revoke the entire family.
        if (matched.revoked) {
            refreshTokenRepository.revokeAllByUserId(matched.userId)
            throw UnauthorizedException("Token reuse detected — all sessions revoked")
        }

        // Mark used token as revoked (rotation)
        matched.revoked = true
        refreshTokenRepository.save(matched)

        val user = userRepository.findById(matched.userId).orElseThrow()
        val newRawRefresh = UUID.randomUUID().toString()
        refreshTokenRepository.save(RefreshToken(
            userId = user.id,
            tokenHash = passwordEncoder.encode(newRawRefresh),
            expiresAt = Instant.now().plus(jwtConfig.refreshTokenExpiryDays, ChronoUnit.DAYS)
        ))
        return jwtTokenProvider.generateToken(user.email, user.id)
    }

    fun logout(userId: UUID) {
        refreshTokenRepository.revokeAllByUserId(userId)
    }
}
```

> **Note on refresh:** The naive findAll approach doesn't scale to millions of tokens. For 100 users this is fine. Add an index on `token_hash` and use a direct lookup if load grows.

- [ ] **Step 4: AuthController**

```kotlin
// api/auth/AuthController.kt
@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest, response: HttpServletResponse): LoginResponse {
        val (loginResponse, rawRefresh) = authService.login(request)
        val cookie = Cookie("refreshToken", rawRefresh).apply {
            isHttpOnly = true; secure = true; path = "/api/auth/refresh"
            maxAge = 7 * 24 * 60 * 60
        }
        response.addCookie(cookie)
        return loginResponse
    }

    @PostMapping("/refresh")
    fun refresh(
        @CookieValue("refreshToken") rawToken: String,
        response: HttpServletResponse
    ): Map<String, String> {
        val accessToken = authService.refresh(rawToken)
        return mapOf("accessToken" to accessToken)
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(
        @AuthenticationPrincipal userDetails: UserDetails,
        response: HttpServletResponse
    ) {
        val user = userRepository.findByEmail(userDetails.username)!!
        authService.logout(user.id)
        val cookie = Cookie("refreshToken", "").apply {
            maxAge = 0; isHttpOnly = true; path = "/api/auth/refresh"
        }
        response.addCookie(cookie)
    }
}
```

- [ ] **Step 5: GlobalExceptionHandler**

```kotlin
// api/common/GlobalExceptionHandler.kt
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleUnauthorized(e: UnauthorizedException) = mapOf("message" to e.message)

    @ExceptionHandler(ForbiddenException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleForbidden(e: ForbiddenException) = mapOf("message" to e.message)

    @ExceptionHandler(NotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleNotFound(e: NotFoundException) = mapOf("message" to e.message)

    @ExceptionHandler(ConflictException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleConflict(e: ConflictException) = mapOf("message" to e.message)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidation(e: MethodArgumentNotValidException): Map<String, Any> {
        val errors = e.bindingResult.fieldErrors.map {
            mapOf("field" to it.field, "message" to (it.defaultMessage ?: "Invalid"))
        }
        return mapOf("errors" to errors)
    }
}

// Custom exceptions (same file or separate)
class UnauthorizedException(msg: String) : RuntimeException(msg)
class ForbiddenException(msg: String) : RuntimeException(msg)
class NotFoundException(msg: String) : RuntimeException(msg)
class ConflictException(msg: String) : RuntimeException(msg)
```

- [ ] **Step 6: Run auth tests**

```bash
./gradlew test --tests "*.AuthControllerTest"
```
Expected: PASS (both tests green)

- [ ] **Step 7: Commit**

```bash
git add backend/src/
git commit -m "feat: auth API (login, refresh, logout)"
```

---

## Task 6: Employee API

**Files:**
- Create: `api/employee/EmployeeController.kt`, `EmployeeService.kt`, `dto/*`
- Create: `api/common/PageResponse.kt`

- [ ] **Step 1: Write failing employee tests**

```kotlin
// api/employee/EmployeeControllerTest.kt
@AutoConfigureMockMvc
class EmployeeControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    private lateinit var adminToken: String

    @BeforeEach
    fun setup() {
        // create admin user + employee, get JWT
        // (helper: createAdminAndGetToken())
        adminToken = createAdminAndGetToken()
    }

    @Test
    fun `list employees returns paginated results`() {
        mvc.get("/api/employees") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.data") { isArray() }
            jsonPath("$.total") { isNumber() }
        }
    }

    @Test
    fun `create employee returns 201 with employee detail`() {
        val body = mapOf(
            "fullName" to "Bob Smith", "email" to "bob@test.com",
            "password" to "Password1", "department" to "Engineering",
            "jobTitle" to "Developer", "employmentType" to "FULL_TIME",
            "hiredAt" to "2024-01-15"
        )
        mvc.post("/api/employees") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isCreated() }
            jsonPath("$.fullName") { value("Bob Smith") }
        }
    }

    @Test
    fun `create employee with duplicate email returns 409`() {
        val body = mapOf(/* same email twice */)
        mvc.post("/api/employees") { /* first */ }
        mvc.post("/api/employees") { /* second, same email */ }
            .andExpect { status { isConflict() } }
    }

    @Test
    fun `employee cannot patch another employee`() {
        val empToken = createEmployeeAndGetToken("carol@test.com")
        mvc.patch("/api/employees/{id}", someOtherEmployeeId) {
            header("Authorization", "Bearer $empToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("phone" to "123456789"))
        }.andExpect { status { isForbidden() } }
    }
}
```

Run: `./gradlew test --tests "*.EmployeeControllerTest"` → Expected: FAIL

- [ ] **Step 2: PageResponse DTO**

```kotlin
// api/common/PageResponse.kt
data class PageResponse<T>(
    val data: List<T>,
    val page: Int,
    val pageSize: Int,
    val total: Long
)
```

- [ ] **Step 3: Employee DTOs**

```kotlin
// CreateEmployeeRequest.kt
data class CreateEmployeeRequest(
    @field:NotBlank @field:Size(max=255) val fullName: String,
    @field:Email @field:Size(max=255) val email: String,
    @field:NotBlank @field:Size(min=8) val password: String,
    @field:Pattern(regexp="[0-9 +\\-()]{7,20}") val phone: String? = null,
    @field:NotBlank @field:Size(max=100) val department: String,
    val team: String? = null,
    @field:NotBlank @field:Size(max=100) val jobTitle: String,
    val grade: String? = null,
    val employmentType: EmploymentType,
    val hiredAt: LocalDate
)

// UpdateEmployeeRequest.kt — all fields optional
data class UpdateEmployeeRequest(
    val fullName: String? = null, val email: String? = null,
    val phone: String? = null, val department: String? = null,
    val team: String? = null, val jobTitle: String? = null,
    val grade: String? = null, val employmentType: EmploymentType? = null,
    val hiredAt: LocalDate? = null
)

// EmployeeSummary.kt
data class EmployeeSummary(
    val id: UUID, val fullName: String, val email: String,
    val department: String, val team: String?, val jobTitle: String,
    val employmentType: String, val totalAllocationPercent: Int
)

// EmployeeDetail.kt
data class EmployeeDetail(
    val id: UUID, val fullName: String, val email: String,
    val phone: String?, val department: String, val team: String?,
    val jobTitle: String, val grade: String?, val employmentType: String,
    val hiredAt: LocalDate, val isActive: Boolean,
    val skills: List<Any>, val assignments: List<Any>
)
```

- [ ] **Step 4: EmployeeService**

```kotlin
// api/employee/EmployeeService.kt
@Service
@Transactional
class EmployeeService(
    private val employeeRepository: EmployeeRepository,
    private val userRepository: UserRepository,
    private val assignmentRepository: ProjectAssignmentRepository,
    private val passwordEncoder: PasswordEncoder
) {
    fun list(search: String?, department: String?, employmentType: EmploymentType?,
             pageable: Pageable): PageResponse<EmployeeSummary> {
        val page = employeeRepository.search(search, department, employmentType, pageable)
        return PageResponse(
            data = page.content.map { it.toSummary() },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    fun getDetail(id: UUID): EmployeeDetail =
        employeeRepository.findById(id).orElseThrow { NotFoundException("Employee not found") }
            .toDetail()

    fun create(request: CreateEmployeeRequest): EmployeeDetail {
        if (userRepository.findByEmail(request.email) != null)
            throw ConflictException("Email already in use")

        val employee = employeeRepository.save(Employee(
            fullName = request.fullName, email = request.email,
            phone = request.phone, department = request.department,
            team = request.team, jobTitle = request.jobTitle,
            grade = request.grade, employmentType = request.employmentType,
            hiredAt = request.hiredAt
        ))
        userRepository.save(User(
            email = request.email,
            passwordHash = passwordEncoder.encode(request.password),
            role = UserRole.EMPLOYEE,
            employeeId = employee.id
        ))
        return employee.toDetail()
    }

    fun update(id: UUID, request: UpdateEmployeeRequest, callerUser: User): EmployeeDetail {
        val employee = employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
        val isOwnProfile = callerUser.employeeId == id
        val isAdmin = callerUser.role == UserRole.ADMIN

        if (!isAdmin && !isOwnProfile) throw ForbiddenException("Cannot edit another employee")

        if (isAdmin) {
            request.fullName?.let { employee.fullName = it }
            request.email?.let { employee.email = it }
            request.department?.let { employee.department = it }
            request.jobTitle?.let { employee.jobTitle = it }
            request.employmentType?.let { employee.employmentType = it }
            request.hiredAt?.let { employee.hiredAt = it }
        }
        // Employee-editable fields (both roles can set)
        request.phone?.let { employee.phone = it }
        request.team?.let { employee.team = it }
        request.grade?.let { employee.grade = it }

        return employeeRepository.save(employee).toDetail()
    }

    fun deactivate(id: UUID) {
        val employee = employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
        employee.isActive = false
        employeeRepository.save(employee)
        userRepository.findByEmployeeId(id)?.let { it.isActive = false; userRepository.save(it) }
        assignmentRepository.findByEmployeeId(id)
            .filter { it.isActive }
            .forEach { it.isActive = false; assignmentRepository.save(it) }
    }

    private fun Employee.toSummary(): EmployeeSummary {
        val total = assignmentRepository.sumTodayAllocation(id, UUID(0L, 0L))
        return EmployeeSummary(id, fullName, email, department, team, jobTitle, employmentType.name, total)
    }

    private fun Employee.toDetail() = EmployeeDetail(
        id, fullName, email, phone, department, team, jobTitle,
        grade, employmentType.name, hiredAt, isActive, emptyList(), emptyList()
    )
}
```

- [ ] **Step 5: EmployeeController**

```kotlin
// api/employee/EmployeeController.kt
@RestController
@RequestMapping("/api/employees")
class EmployeeController(
    private val employeeService: EmployeeService,
    private val userRepository: UserRepository
) {
    @GetMapping
    fun list(
        @RequestParam search: String?,
        @RequestParam department: String?,
        @RequestParam employmentType: EmploymentType?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = employeeService.list(search, department, employmentType,
        PageRequest.of(page - 1, pageSize))

    @GetMapping("/available")
    fun available(
        @RequestParam minAvailablePercent: Int,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) fromDate: LocalDate,
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) toDate: LocalDate,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = employeeService.listAvailable(minAvailablePercent, fromDate, toDate,
        PageRequest.of(page - 1, pageSize))

    @GetMapping("/{id}")
    fun getOne(@PathVariable id: UUID) = employeeService.getDetail(id)

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateEmployeeRequest) =
        employeeService.create(request)

    @PatchMapping("/{id}")
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: UpdateEmployeeRequest,
        @AuthenticationPrincipal userDetails: UserDetails
    ): EmployeeDetail {
        val caller = userRepository.findByEmail(userDetails.username)!!
        return employeeService.update(id, request, caller)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deactivate(@PathVariable id: UUID) = employeeService.deactivate(id)
}
```

- [ ] **Step 6: Run employee tests**

```bash
./gradlew test --tests "*.EmployeeControllerTest"
```
Expected: PASS

- [ ] **Step 7: Implement `listAvailable` in EmployeeService** (add JPQL query to repository for availability filter)

```kotlin
// Add to EmployeeRepository:
// Checks today's allocation is below threshold AND no 100%-capacity assignment covers the full requested range
@Query("""
    SELECT e FROM Employee e WHERE e.isActive = true
    AND (100 - (
        SELECT COALESCE(SUM(pa.allocationPercent), 0)
        FROM ProjectAssignment pa
        WHERE pa.employeeId = e.id AND pa.isActive = true
          AND pa.startDate <= CURRENT_DATE
          AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
    )) >= :minAvailable
    AND NOT EXISTS (
        SELECT pa FROM ProjectAssignment pa
        WHERE pa.employeeId = e.id AND pa.isActive = true
          AND pa.allocationPercent = 100
          AND pa.startDate <= :fromDate
          AND (pa.endDate IS NULL OR pa.endDate >= :toDate)
    )
""")
fun findAvailable(
    minAvailable: Int,
    fromDate: LocalDate,
    toDate: LocalDate,
    pageable: Pageable
): Page<Employee>
```

Also update `EmployeeService.listAvailable` to pass `fromDate`/`toDate` through:

```kotlin
fun listAvailable(minAvailablePercent: Int, fromDate: LocalDate, toDate: LocalDate,
                  pageable: Pageable): PageResponse<EmployeeSummary> {
    val page = employeeRepository.findAvailable(minAvailablePercent, fromDate, toDate, pageable)
    return PageResponse(page.content.map { it.toSummary() }, pageable.pageNumber + 1, pageable.pageSize, page.totalElements)
}
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/
git commit -m "feat: employee CRUD API"
```

---

## Task 7: Skills API

**Files:**
- Create: `api/skill/SkillController.kt`, `SkillService.kt`, `dto/*`

- [ ] **Step 1: Write failing skill tests**

```kotlin
// api/skill/SkillControllerTest.kt
@Test
fun `admin can create a skill`() {
    mvc.post("/api/skills") {
        header("Authorization", "Bearer $adminToken")
        contentType = MediaType.APPLICATION_JSON
        content = """{"name":"Kotlin","category":"Backend"}"""
    }.andExpect { status { isCreated() }; jsonPath("$.name") { value("Kotlin") } }
}

@Test
fun `duplicate skill name returns 409`() {
    // create once, then again
}

@Test
fun `employee can add skill to own profile`() {
    // POST /api/employees/{id}/skills with employee token
}

@Test
fun `employee cannot add skill to another employee`() {
    // POST /api/employees/{otherId}/skills → 403
}

@Test
fun `cannot delete skill in use`() {
    // assign skill, then try DELETE /api/skills/{id} → 409
}
```

Run: `./gradlew test --tests "*.SkillControllerTest"` → Expected: FAIL

- [ ] **Step 2: SkillService**

```kotlin
@Service
@Transactional
class SkillService(
    private val skillRepository: SkillRepository,
    private val employeeSkillRepository: EmployeeSkillRepository,
    private val employeeRepository: EmployeeRepository,
    private val userRepository: UserRepository
) {
    fun listAll(category: String?) =
        if (category != null) skillRepository.findByCategory(category)
        else skillRepository.findAll()

    fun getOne(id: UUID) = skillRepository.findById(id)
        .orElseThrow { NotFoundException("Skill not found") }

    fun create(request: CreateSkillRequest): Skill {
        if (skillRepository.existsByName(request.name)) throw ConflictException("Skill name already exists")
        return skillRepository.save(Skill(name = request.name, category = request.category, description = request.description))
    }

    fun update(id: UUID, request: CreateSkillRequest): Skill {
        val skill = getOne(id)
        if (skillRepository.existsByNameAndIdNot(request.name, id)) throw ConflictException("Name conflict")
        request.name.let { skill.name = it }
        request.category.let { skill.category = it }
        skill.description = request.description
        return skillRepository.save(skill)
    }

    fun delete(id: UUID) {
        if (employeeSkillRepository.existsBySkillId(id)) throw ConflictException("Skill is in use")
        skillRepository.deleteById(id)
    }

    fun getEmployeeSkills(employeeId: UUID) = employeeSkillRepository.findByEmployeeId(employeeId)

    fun addSkillToEmployee(employeeId: UUID, request: EmployeeSkillRequest, caller: User): EmployeeSkill {
        assertCanEditEmployee(employeeId, caller)
        if (!employeeRepository.existsById(employeeId)) throw NotFoundException("Employee not found")
        if (!skillRepository.existsById(request.skillId)) throw NotFoundException("Skill not found")
        if (employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, request.skillId))
            throw ConflictException("Skill already assigned")
        return employeeSkillRepository.save(EmployeeSkill(
            employeeId = employeeId, skillId = request.skillId,
            proficiency = request.proficiency, certified = request.certified ?: false,
            note = request.note
        ))
    }

    fun updateEmployeeSkill(employeeId: UUID, skillId: UUID, request: EmployeeSkillRequest, caller: User): EmployeeSkill {
        assertCanEditEmployee(employeeId, caller)
        val es = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
            ?: throw NotFoundException("Skill not assigned")
        request.proficiency.let { es.proficiency = it }
        request.certified?.let { es.certified = it }
        request.note?.let { es.note = it }
        return employeeSkillRepository.save(es)
    }

    fun removeEmployeeSkill(employeeId: UUID, skillId: UUID, caller: User) {
        assertCanEditEmployee(employeeId, caller)
        val es = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
            ?: throw NotFoundException("Skill not assigned")
        employeeSkillRepository.delete(es)
    }

    private fun assertCanEditEmployee(employeeId: UUID, caller: User) {
        if (caller.role != UserRole.ADMIN && caller.employeeId != employeeId)
            throw ForbiddenException("Cannot edit another employee's skills")
    }
}
```

- [ ] **Step 3: SkillController**

```kotlin
@RestController
class SkillController(private val skillService: SkillService, private val userRepository: UserRepository) {

    @GetMapping("/api/skills")
    fun list(@RequestParam category: String?) = skillService.listAll(category)

    @GetMapping("/api/skills/{id}")
    fun getOne(@PathVariable id: UUID) = skillService.getOne(id)

    @PostMapping("/api/skills")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody req: CreateSkillRequest) = skillService.create(req)

    @PatchMapping("/api/skills/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: UUID, @RequestBody req: CreateSkillRequest) = skillService.update(id, req)

    @DeleteMapping("/api/skills/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: UUID) = skillService.delete(id)

    @GetMapping("/api/employees/{id}/skills")
    fun getEmployeeSkills(@PathVariable id: UUID) = skillService.getEmployeeSkills(id)

    @PostMapping("/api/employees/{id}/skills")
    @ResponseStatus(HttpStatus.CREATED)
    fun addSkill(
        @PathVariable id: UUID,
        @Valid @RequestBody req: EmployeeSkillRequest,
        @AuthenticationPrincipal ud: UserDetails
    ) = skillService.addSkillToEmployee(id, req, userRepository.findByEmail(ud.username)!!)

    @PatchMapping("/api/employees/{empId}/skills/{skillId}")
    fun updateSkill(
        @PathVariable empId: UUID, @PathVariable skillId: UUID,
        @RequestBody req: EmployeeSkillRequest, @AuthenticationPrincipal ud: UserDetails
    ) = skillService.updateEmployeeSkill(empId, skillId, req, userRepository.findByEmail(ud.username)!!)

    @DeleteMapping("/api/employees/{empId}/skills/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeSkill(
        @PathVariable empId: UUID, @PathVariable skillId: UUID,
        @AuthenticationPrincipal ud: UserDetails
    ) = skillService.removeEmployeeSkill(empId, skillId, userRepository.findByEmail(ud.username)!!)
}
```

- [ ] **Step 4: Run skill tests**

```bash
./gradlew test --tests "*.SkillControllerTest"
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: skills API"
```

---

## Task 8: Allocation API

**Files:**
- Create: `api/allocation/AllocationController.kt`, `AllocationService.kt`, `dto/*`

- [ ] **Step 1: Write failing allocation tests — including cap enforcement**

```kotlin
// api/allocation/AllocationControllerTest.kt
@Test
fun `admin can create allocation`() {
    val body = mapOf("employeeId" to employeeId, "projectName" to "Project X",
        "roleInProject" to "Developer", "allocationPercent" to 60,
        "startDate" to "2026-01-01")
    mvc.post("/api/allocations") {
        header("Authorization", "Bearer $adminToken")
        contentType = MediaType.APPLICATION_JSON
        content = objectMapper.writeValueAsString(body)
    }.andExpect { status { isCreated() } }
}

@Test
fun `creating allocation that exceeds 100 percent returns 409`() {
    // create 60% allocation, then try 50% → 409
    createAllocation(60)
    mvc.post("/api/allocations") {
        /* 50% for same employee */
    }.andExpect { status { isConflict() } }
}

@Test
fun `soft delete sets isActive to false`() {
    val id = createAllocationAndGetId(60)
    mvc.delete("/api/allocations/$id") {
        header("Authorization", "Bearer $adminToken")
    }.andExpect { status { isNoContent() } }
    // verify in DB: isActive == false
    val assignment = assignmentRepository.findById(id).get()
    assertThat(assignment.isActive).isFalse()
}
```

Run: `./gradlew test --tests "*.AllocationControllerTest"` → Expected: FAIL

- [ ] **Step 2: AllocationService with cap enforcement**

```kotlin
@Service
class AllocationService(
    private val assignmentRepository: ProjectAssignmentRepository,
    private val employeeRepository: EmployeeRepository
) {
    @Transactional(isolation = Isolation.SERIALIZABLE)
    fun create(request: CreateAllocationRequest): ProjectAssignment {
        if (!employeeRepository.existsById(request.employeeId))
            throw NotFoundException("Employee not found")

        // Lock all active assignments to prevent concurrent modification
        assignmentRepository.findActiveForUpdateLock(request.employeeId)

        val currentTotal = assignmentRepository.sumTodayAllocation(
            request.employeeId, UUID(0L, 0L)
        )
        if (currentTotal + request.allocationPercent > 100)
            throw ConflictException(
                "Would exceed 100% allocation (current: $currentTotal%, requested: ${request.allocationPercent}%)"
            )

        return assignmentRepository.save(ProjectAssignment(
            employeeId = request.employeeId,
            projectName = request.projectName,
            roleInProject = request.roleInProject,
            allocationPercent = request.allocationPercent,
            startDate = request.startDate,
            endDate = request.endDate
        ))
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    fun update(id: UUID, request: UpdateAllocationRequest): ProjectAssignment {
        val assignment = assignmentRepository.findById(id)
            .orElseThrow { NotFoundException("Allocation not found") }

        request.allocationPercent?.let { newPct ->
            assignmentRepository.findActiveForUpdateLock(assignment.employeeId)
            val currentTotal = assignmentRepository.sumTodayAllocation(assignment.employeeId, id)
            if (currentTotal + newPct > 100)
                throw ConflictException("Would exceed 100% allocation")
            assignment.allocationPercent = newPct
        }
        request.startDate?.let { assignment.startDate = it }
        request.endDate?.let { assignment.endDate = it }
        request.isActive?.let { assignment.isActive = it }

        return assignmentRepository.save(assignment)
    }

    @Transactional
    fun softDelete(id: UUID) {
        val assignment = assignmentRepository.findById(id)
            .orElseThrow { NotFoundException("Allocation not found") }
        assignment.isActive = false
        assignmentRepository.save(assignment)
    }

    fun listAll(employeeId: UUID?, projectName: String?, isActive: Boolean?,
                pageable: Pageable): PageResponse<AllocationResponse> {
        // query with optional filters — implement in repository
        val all = assignmentRepository.findAll() // simplified; add @Query filter
        return PageResponse(all.map { it.toResponse() }, 1, 100, all.size.toLong())
    }

    fun listForEmployee(employeeId: UUID) =
        assignmentRepository.findByEmployeeId(employeeId).map { it.toResponse() }

    private fun ProjectAssignment.toResponse() = AllocationResponse(
        id, projectName, roleInProject, allocationPercent, startDate, endDate, isActive
    )
}
```

- [ ] **Step 3: AllocationController**

```kotlin
@RestController
@RequestMapping("/api/allocations")
class AllocationController(private val allocationService: AllocationService) {

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun listAll(
        @RequestParam employeeId: UUID?, @RequestParam projectName: String?,
        @RequestParam isActive: Boolean?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = allocationService.listAll(employeeId, projectName, isActive, PageRequest.of(page - 1, pageSize))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateAllocationRequest) =
        allocationService.create(request)

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: UUID, @RequestBody request: UpdateAllocationRequest) =
        allocationService.update(id, request)

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun softDelete(@PathVariable id: UUID) = allocationService.softDelete(id)
}

// Add this route to EmployeeController (not a loose function — it belongs to the class):
// In EmployeeController, inject allocationService and add:
@GetMapping("/{id}/allocations")
fun listAllocations(
    @PathVariable id: UUID,
    @AuthenticationPrincipal ud: UserDetails
): List<AllocationResponse> {
    val caller = userRepository.findByEmail(ud.username)!!
    if (caller.role != UserRole.ADMIN && caller.employeeId != id)
        throw ForbiddenException("Cannot view another employee's allocations")
    return allocationService.listForEmployee(id)
}
```

- [ ] **Step 4: Run allocation tests**

```bash
./gradlew test --tests "*.AllocationControllerTest"
```
Expected: PASS (including cap enforcement test)

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: allocation API with SERIALIZABLE cap enforcement"
```

---

## Task 9: Admin Dashboard API

**Files:**
- Create: `api/admin/AdminController.kt`, `AdminService.kt`

- [ ] **Step 1: Write failing dashboard test**

```kotlin
@Test
fun `admin gets dashboard metrics`() {
    mvc.get("/api/admin/dashboard") {
        header("Authorization", "Bearer $adminToken")
    }.andExpect {
        status { isOk() }
        jsonPath("$.totalActiveEmployees") { isNumber() }
        jsonPath("$.avgAllocationPercent") { isNumber() }
        jsonPath("$.availableEmployees") { isArray() }
        jsonPath("$.topOverAllocated") { isArray() }
    }
}

@Test
fun `employee cannot access dashboard`() {
    mvc.get("/api/admin/dashboard") {
        header("Authorization", "Bearer $employeeToken")
    }.andExpect { status { isForbidden() } }
}
```

Run: `./gradlew test --tests "*.AdminControllerTest"` → Expected: FAIL

- [ ] **Step 2: AdminService**

```kotlin
@Service
@Transactional(readOnly = true)
class AdminService(
    private val employeeRepository: EmployeeRepository,
    private val assignmentRepository: ProjectAssignmentRepository
) {
    fun getDashboard(): DashboardResponse {
        val activeEmployees = employeeRepository.findAll().filter { it.isActive }
        val totalActive = activeEmployees.size

        val allocations = activeEmployees.map { emp ->
            assignmentRepository.sumTodayAllocation(emp.id, UUID(0L, 0L))
        }
        val avg = if (allocations.isEmpty()) 0.0 else allocations.average()

        val thirtyDaysFromNow = LocalDate.now().plusDays(30)
        val available = employeeRepository.findAvailable(50, PageRequest.of(0, 10))
            .content.map { it.toSummary() }

        val topOverAllocated = activeEmployees.zip(allocations)
            .sortedByDescending { it.second }
            .take(5)
            .map { (emp, pct) -> mapOf("employee" to emp.toSummary(), "allocationPercent" to pct) }

        return DashboardResponse(totalActive, avg, available, topOverAllocated)
    }
}

data class DashboardResponse(
    val totalActiveEmployees: Int,
    val avgAllocationPercent: Double,
    val availableEmployees: List<EmployeeSummary>,
    val topOverAllocated: List<Map<String, Any>>
)
```

- [ ] **Step 3: AdminController**

```kotlin
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(private val adminService: AdminService) {
    @GetMapping("/dashboard")
    fun dashboard() = adminService.getDashboard()
}
```

- [ ] **Step 4: Run all backend tests**

```bash
./gradlew test
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/
git commit -m "feat: admin dashboard API — completes backend"
```

---

## Task 10: Frontend Project Setup

**Files:**
- Create: `frontend/package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- Create: `frontend/src/lib/types/index.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd D:/2026_cluade_build/superpowers/wbs
npx create-next-app@latest frontend \
  --typescript --tailwind --app --src-dir \
  --no-eslint --import-alias "@/*"
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
```

- [ ] **Step 2: Shared TypeScript types**

```typescript
// src/lib/types/index.ts
export type UserRole = 'ADMIN' | 'EMPLOYEE'
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'PART_TIME'
export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  employeeId: string
}

export interface EmployeeSummary {
  id: string
  fullName: string
  email: string
  department: string
  team: string | null
  jobTitle: string
  employmentType: EmploymentType
  totalAllocationPercent: number
}

export interface EmployeeDetail extends EmployeeSummary {
  phone: string | null
  grade: string | null
  hiredAt: string
  isActive: boolean
  skills: EmployeeSkill[]
  assignments: Allocation[]
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
}

export interface EmployeeSkill {
  id: string
  skill: Skill
  proficiency: Proficiency
  certified: boolean
  note?: string
}

export interface Allocation {
  id: string
  projectName: string
  roleInProject: string
  allocationPercent: number
  startDate: string
  endDate: string | null
  isActive: boolean
}

export interface PageResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
}

export interface DashboardData {
  totalActiveEmployees: number
  avgAllocationPercent: number
  availableEmployees: EmployeeSummary[]
  topOverAllocated: Array<{ employee: EmployeeSummary; allocationPercent: number }>
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/
git commit -m "feat: frontend project setup and shared types"
```

---

## Task 11: API Client Layer

**Files:**
- Create: `src/lib/api/client.ts`, `auth.ts`, `employees.ts`, `skills.ts`, `allocations.ts`
- Create: `src/store/auth.ts`

- [ ] **Step 1: Base API client**

```typescript
// src/lib/api/client.ts
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies for refresh token
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, attempt token refresh once
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, { withCredentials: true })
        localStorage.setItem('accessToken', data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

- [ ] **Step 2: Auth API calls**

```typescript
// src/lib/api/auth.ts
import { apiClient } from './client'
import { AuthUser } from '../types'

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await apiClient.post('/api/auth/login', { email, password })
  localStorage.setItem('accessToken', data.accessToken)
  return data.user
}

export async function logout() {
  await apiClient.post('/api/auth/logout')
  localStorage.removeItem('accessToken')
}
```

- [ ] **Step 3: Employees API calls**

```typescript
// src/lib/api/employees.ts
import { apiClient } from './client'
import { EmployeeDetail, EmployeeSummary, PageResponse } from '../types'

export async function listEmployees(params?: {
  search?: string; department?: string; page?: number; pageSize?: number
}): Promise<PageResponse<EmployeeSummary>> {
  const { data } = await apiClient.get('/api/employees', { params })
  return data
}

export async function getEmployee(id: string): Promise<EmployeeDetail> {
  const { data } = await apiClient.get(`/api/employees/${id}`)
  return data
}

export async function createEmployee(body: Record<string, unknown>): Promise<EmployeeDetail> {
  const { data } = await apiClient.post('/api/employees', body)
  return data
}

export async function updateEmployee(id: string, body: Record<string, unknown>): Promise<EmployeeDetail> {
  const { data } = await apiClient.patch(`/api/employees/${id}`, body)
  return data
}

export async function deactivateEmployee(id: string): Promise<void> {
  await apiClient.delete(`/api/employees/${id}`)
}

export async function listAvailableEmployees(params: {
  minAvailablePercent: number; fromDate: string; toDate: string
}): Promise<PageResponse<EmployeeSummary>> {
  const { data } = await apiClient.get('/api/employees/available', { params })
  return data
}
```

- [ ] **Step 4: Skills and Allocations API calls** (same pattern as employees — create `skills.ts` and `allocations.ts`)

- [ ] **Step 5: Auth store (localStorage-backed)**

```typescript
// src/store/auth.ts
import { AuthUser } from '@/lib/types'

const KEY = 'auth_user'

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function storeUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem(KEY)
  localStorage.removeItem('accessToken')
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/ frontend/src/store/
git commit -m "feat: API client layer and auth store"
```

---

## Task 12: Auth UI + Route Protection

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/components/guards/AdminGuard.tsx`
- Create: `src/lib/hooks/useAuth.ts`

- [ ] **Step 1: Middleware (route protection)**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
  // Access token lives in localStorage (client-only) — middleware can't check it
  // Rely on client-side redirect in useAuth hook for SPA navigation
  // For hard navigations, check a `logged_in` cookie (set on login, cleared on logout)
  const loggedIn = request.cookies.get('logged_in')
  if (!loggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|favicon.ico|api).*)'] }
```

> **Note:** Set a non-HttpOnly `logged_in=true` cookie on login (in addition to the HttpOnly refreshToken) so middleware can check auth state.

- [ ] **Step 2: useAuth hook**

```typescript
// src/lib/hooks/useAuth.ts
'use client'
import { useState, useEffect } from 'react'
import { AuthUser } from '@/lib/types'
import { login as apiLogin, logout as apiLogout } from '@/lib/api/auth'
import { getStoredUser, storeUser, clearUser } from '@/store/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => { setUser(getStoredUser()) }, [])

  async function login(email: string, password: string) {
    const u = await apiLogin(email, password)
    storeUser(u)
    setUser(u)
    router.push('/employees')
  }

  async function logout() {
    await apiLogout()
    clearUser()
    setUser(null)
    router.push('/login')
  }

  return { user, login, logout, isAdmin: user?.role === 'ADMIN' }
}
```

- [ ] **Step 3: Login page**

```tsx
// src/app/login/page.tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.status === 403
        ? 'Account is deactivated'
        : 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-80 space-y-4">
        <h1 className="text-xl font-semibold">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded p-2 text-sm" required />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded p-2 text-sm" required />
        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 text-sm">
          Sign In
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: AdminGuard**

```tsx
// src/components/guards/AdminGuard.tsx
'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user !== null && !isAdmin) router.replace('/employees')
  }, [user, isAdmin])

  if (!user || !isAdmin) return null
  return <>{children}</>
}
```

- [ ] **Step 5: Root layout with QueryClientProvider**

```tsx
// src/app/layout.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import NavBar from '@/components/layout/NavBar'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } }
  }))
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <NavBar />
          <main className="container mx-auto p-4">{children}</main>
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Start both servers and manually verify login flow**

```bash
# Terminal 1: backend
cd backend && ./gradlew bootRun

# Terminal 2: frontend
cd frontend && npm run dev
```
Open http://localhost:3000 → should redirect to /login → sign in → redirects to /employees

- [ ] **Step 7: Commit**

```bash
git add frontend/src/
git commit -m "feat: auth UI, route protection, admin guard"
```

---

## Task 13: Employee Directory Page

**Files:**
- Create: `src/components/ui/EmployeeCard.tsx`, `AllocationBar.tsx`, `Pagination.tsx`
- Create: `src/lib/hooks/useEmployees.ts`
- Modify: `src/app/employees/page.tsx`

- [ ] **Step 1: TanStack Query hooks**

```typescript
// src/lib/hooks/useEmployees.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listEmployees, getEmployee, createEmployee, updateEmployee, deactivateEmployee } from '@/lib/api/employees'

export function useEmployeeList(params?: Parameters<typeof listEmployees>[0]) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => listEmployees(params),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => updateEmployee(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }) },
  })
}
```

- [ ] **Step 2: AllocationBar component**

```tsx
// src/components/ui/AllocationBar.tsx
interface Props { percent: number }
export default function AllocationBar({ percent }: Props) {
  const color = percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${percent}%` }} />
    </div>
  )
}
```

- [ ] **Step 3: EmployeeCard component**

```tsx
// src/components/ui/EmployeeCard.tsx
import Link from 'next/link'
import AllocationBar from './AllocationBar'
import type { EmployeeSummary } from '@/lib/types'

export default function EmployeeCard({ employee }: { employee: EmployeeSummary }) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
            {employee.fullName[0]}
          </div>
          <div>
            <p className="font-medium text-sm">{employee.fullName}</p>
            <p className="text-xs text-gray-500">{employee.jobTitle} · {employee.department}</p>
          </div>
        </div>
        <AllocationBar percent={employee.totalAllocationPercent} />
        <p className="text-xs text-gray-400 mt-1">{employee.totalAllocationPercent}% allocated</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Employee directory page**

```tsx
// src/app/employees/page.tsx
'use client'
import { useState } from 'react'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useEmployeeList } from '@/lib/hooks/useEmployees'

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useEmployeeList({ search: search || undefined, department: department || undefined, page })

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <input placeholder="Search by name..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="border rounded p-2 text-sm w-64" />
        <input placeholder="Department"
          value={department} onChange={e => { setDepartment(e.target.value); setPage(1) }}
          className="border rounded p-2 text-sm w-48" />
      </div>
      {isLoading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
        </div>
      )}
      {data && (
        <div className="flex gap-2 mt-6 justify-center">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm py-1">Page {page} of {Math.ceil(data.total / data.pageSize)}</span>
          <button disabled={page >= Math.ceil(data.total / data.pageSize)} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser** — navigate to /employees, see cards with allocation bars

- [ ] **Step 6: Commit**

```bash
git add frontend/src/
git commit -m "feat: employee directory page with search and allocation bars"
```

---

## Task 14: Employee Detail + Self-Edit Pages

**Files:**
- Create: `src/components/ui/SkillBadge.tsx`
- Modify: `src/app/employees/[id]/page.tsx`
- Modify: `src/app/employees/[id]/edit/page.tsx`

- [ ] **Step 1: SkillBadge component**

```tsx
// src/components/ui/SkillBadge.tsx
import type { Proficiency } from '@/lib/types'
const colors: Record<Proficiency, string> = {
  BEGINNER: 'bg-gray-100 text-gray-600',
  INTERMEDIATE: 'bg-blue-100 text-blue-700',
  EXPERT: 'bg-green-100 text-green-700',
}
export default function SkillBadge({ name, proficiency }: { name: string; proficiency: Proficiency }) {
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${colors[proficiency]}`}>
      {name} · {proficiency.toLowerCase()}
    </span>
  )
}
```

- [ ] **Step 2: Employee detail page**

```tsx
// src/app/employees/[id]/page.tsx
// IMPORTANT: This must be a CLIENT component.
// getEmployee uses axios which reads localStorage for the access token.
// localStorage is unavailable in server components — use 'use client' + TanStack Query.
'use client'
import { useEmployee } from '@/lib/hooks/useEmployees'
import SkillBadge from '@/components/ui/SkillBadge'
import AllocationBar from '@/components/ui/AllocationBar'
import Link from 'next/link'

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const { data: employee, isLoading } = useEmployee(params.id)
  if (isLoading || !employee) return <p>Loading...</p>
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{employee.fullName}</h1>
          <p className="text-gray-500">{employee.jobTitle} · {employee.department}</p>
        </div>
        <Link href={`/employees/${employee.id}/edit`}
          className="text-sm text-blue-600 border border-blue-600 rounded px-3 py-1">
          Edit Profile
        </Link>
      </div>

      <section>
        <h2 className="font-medium mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {employee.skills.map(es => (
            <SkillBadge key={es.id} name={es.skill.name} proficiency={es.proficiency} />
          ))}
          {employee.skills.length === 0 && <p className="text-sm text-gray-400">No skills added</p>}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-2">Current Assignments</h2>
        <AllocationBar percent={employee.totalAllocationPercent} />
        <p className="text-sm text-gray-500 mt-1">{employee.totalAllocationPercent}% total allocated</p>
        <div className="space-y-2 mt-3">
          {employee.assignments.filter(a => a.isActive).map(a => (
            <div key={a.id} className="border rounded p-3 text-sm">
              <p className="font-medium">{a.projectName}</p>
              <p className="text-gray-500">{a.roleInProject} · {a.allocationPercent}%</p>
              <p className="text-gray-400 text-xs">{a.startDate} – {a.endDate ?? 'Ongoing'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Self-edit page** (client component — only own profile fields: phone, team, grade, skills)

```tsx
// src/app/employees/[id]/edit/page.tsx
'use client'
import { useState } from 'react'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function EditProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { data: emp } = useEmployee(params.id)
  const { mutate, isPending } = useUpdateEmployee(params.id)

  const [phone, setPhone] = useState(emp?.phone ?? '')
  const [team, setTeam] = useState(emp?.team ?? '')
  const [grade, setGrade] = useState(emp?.grade ?? '')

  // Guard: only own profile
  if (user && user.employeeId !== params.id) {
    router.replace(`/employees/${params.id}`)
    return null
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutate({ phone: phone || undefined, team: team || undefined, grade: grade || undefined },
      { onSuccess: () => router.push(`/employees/${params.id}`) })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Edit Profile</h1>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full border rounded p-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Team</label>
        <input value={team} onChange={e => setTeam(e.target.value)}
          className="w-full border rounded p-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Grade</label>
        <input value={grade} onChange={e => setGrade(e.target.value)}
          className="w-full border rounded p-2 text-sm" />
      </div>
      <button type="submit" disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
        Save Changes
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: employee detail and self-edit pages"
```

---

## Task 15: Admin Employee Management Pages

**Files:**
- Modify: `src/app/admin/employees/new/page.tsx`
- Modify: `src/app/admin/employees/[id]/edit/page.tsx`
- Create: `src/components/forms/EmployeeForm.tsx`

- [ ] **Step 1: Shared EmployeeForm component**

```tsx
// src/components/forms/EmployeeForm.tsx
'use client'
import { useState } from 'react'
import type { EmployeeDetail } from '@/lib/types'

interface Props {
  initialData?: EmployeeDetail
  isCreate?: boolean             // true = show password field
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
  serverError?: { errors?: { field: string; message: string }[] }
}

export default function EmployeeForm({ initialData, isCreate, onSubmit, isPending, serverError }: Props) {
  const [form, setForm] = useState({
    fullName: initialData?.fullName ?? '',
    email: initialData?.email ?? '',
    password: '',
    phone: initialData?.phone ?? '',
    department: initialData?.department ?? '',
    team: initialData?.team ?? '',
    jobTitle: initialData?.jobTitle ?? '',
    grade: initialData?.grade ?? '',
    employmentType: initialData?.employmentType ?? 'FULL_TIME',
    hiredAt: initialData?.hiredAt ?? '',
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Record<string, unknown> = { ...form }
    if (!isCreate) delete payload.password   // don't send blank password on edit
    onSubmit(payload)
  }

  const fieldError = (field: string) =>
    serverError?.errors?.find(e => e.field === field)?.message

  const Field = ({ label, name, type = 'text' }: { label: string; name: string; type?: string }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} value={(form as any)[name]} onChange={set(name)}
        className="w-full border rounded p-2 text-sm" />
      {fieldError(name) && <p className="text-red-500 text-xs mt-1">{fieldError(name)}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full Name *" name="fullName" />
      <Field label="Email *" name="email" type="email" />
      {isCreate && <Field label="Password *" name="password" type="password" />}
      <Field label="Phone" name="phone" />
      <Field label="Department *" name="department" />
      <Field label="Team" name="team" />
      <Field label="Job Title *" name="jobTitle" />
      <Field label="Grade" name="grade" />
      <div>
        <label className="block text-sm font-medium mb-1">Employment Type *</label>
        <select value={form.employmentType} onChange={set('employmentType')}
          className="w-full border rounded p-2 text-sm">
          <option value="FULL_TIME">Full Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="PART_TIME">Part Time</option>
        </select>
      </div>
      <Field label="Hired At *" name="hiredAt" type="date" />
      <button type="submit" disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create employee page (admin)**

```tsx
// src/app/admin/employees/new/page.tsx
'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useCreateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'

export default function NewEmployeePage() {
  const { mutate, isPending, error } = useCreateEmployee()
  const router = useRouter()
  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Add Employee</h1>
        <EmployeeForm
          onSubmit={(data) => mutate(data, { onSuccess: (emp) => router.push(`/employees/${emp.id}`) })}
          isPending={isPending}
          serverError={(error as any)?.response?.data}
        />
      </div>
    </AdminGuard>
  )
}
```

- [ ] **Step 3: Admin employee edit page**

```tsx
// src/app/admin/employees/[id]/edit/page.tsx
'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'

export default function AdminEditEmployeePage({ params }: { params: { id: string } }) {
  const { data: employee, isLoading } = useEmployee(params.id)
  const { mutate, isPending, error } = useUpdateEmployee(params.id)
  const router = useRouter()

  if (isLoading || !employee) return <p>Loading...</p>

  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Edit Employee</h1>
        <EmployeeForm
          initialData={employee}
          isCreate={false}
          onSubmit={(data) => mutate(data, {
            onSuccess: () => router.push(`/employees/${params.id}`)
          })}
          isPending={isPending}
          serverError={(error as any)?.response?.data}
        />
      </div>
    </AdminGuard>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: admin employee create and edit pages"
```

---

## Task 16: Admin Allocations Page

**Files:**
- Create: `src/components/forms/AllocationForm.tsx`
- Create: `src/lib/hooks/useAllocations.ts`
- Modify: `src/app/admin/allocations/page.tsx`

- [ ] **Step 1: Allocation hooks**

```typescript
// src/lib/hooks/useAllocations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Allocation, PageResponse } from '@/lib/types'

interface AllocationParams {
  employeeId?: string; projectName?: string; isActive?: boolean
  page?: number; pageSize?: number
}

export function useAllocations(params?: AllocationParams) {
  return useQuery({
    queryKey: ['allocations', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PageResponse<Allocation>>('/api/allocations', { params })
      return data
    },
  })
}

export function useCreateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await apiClient.post<Allocation>('/api/allocations', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })
}

export function useUpdateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => {
      const { data } = await apiClient.patch<Allocation>(`/api/allocations/${id}`, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })
}

export function useDeactivateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/allocations/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })
}
```

- [ ] **Step 2: AllocationForm** — fields: employeeId (select from `/api/employees`), projectName, roleInProject, allocationPercent (1-100 number input), startDate (date), endDate (date, optional). On submit, call `onSubmit(data)`. Show field errors from `serverError`.

```tsx
// src/components/forms/AllocationForm.tsx
'use client'
import { useState } from 'react'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import type { Allocation } from '@/lib/types'

interface Props {
  initialData?: Allocation
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
  serverError?: string  // e.g. "Would exceed 100% allocation"
}

export default function AllocationForm({ initialData, onSubmit, isPending, serverError }: Props) {
  const { data: employees } = useEmployeeList({ pageSize: 200 })
  const [form, setForm] = useState({
    employeeId: '',
    projectName: initialData?.projectName ?? '',
    roleInProject: initialData?.roleInProject ?? '',
    allocationPercent: initialData?.allocationPercent ?? 50,
    startDate: initialData?.startDate ?? '',
    endDate: initialData?.endDate ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ ...form, endDate: form.endDate || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Employee *</label>
        <select value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required>
          <option value="">Select employee</option>
          {employees?.data.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.totalAllocationPercent}% allocated)</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Project Name *</label>
        <input value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role *</label>
        <input value={form.roleInProject} onChange={e => setForm(f => ({ ...f, roleInProject: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Allocation % *</label>
        <input type="number" min={1} max={100} value={form.allocationPercent}
          onChange={e => setForm(f => ({ ...f, allocationPercent: +e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Start Date *</label>
        <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Date (leave blank = ongoing)</label>
        <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
          className="w-full border rounded p-2 text-sm" />
      </div>
      <button type="submit" disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Admin allocations page** — table of all allocations + create button that opens AllocationForm. Show 409 conflict message when cap exceeded.

```tsx
// src/app/admin/allocations/page.tsx
'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import AllocationForm from '@/components/forms/AllocationForm'
import { useAllocations, useCreateAllocation, useDeactivateAllocation } from '@/lib/hooks/useAllocations'
import { useState } from 'react'

export default function AllocationsPage() {
  const { data } = useAllocations({ isActive: true })
  const { mutate: create, isPending, error: createError } = useCreateAllocation()
  const { mutate: deactivate } = useDeactivateAllocation()
  const [showForm, setShowForm] = useState(false)

  const conflictMsg = (createError as any)?.response?.data?.message

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Allocations</h1>
          <button onClick={() => setShowForm(s => !s)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {showForm ? 'Cancel' : 'Add Allocation'}
          </button>
        </div>
        {showForm && (
          <div className="border rounded-lg p-4 max-w-lg">
            <AllocationForm
              onSubmit={(data) => create(data, { onSuccess: () => setShowForm(false) })}
              isPending={isPending}
              serverError={conflictMsg}
            />
          </div>
        )}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Employee</th>
              <th className="py-2 pr-4">Project</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">%</th>
              <th className="py-2 pr-4">Start</th>
              <th className="py-2 pr-4">End</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map(a => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">{a.projectName}</td>
                <td className="py-2 pr-4">{a.projectName}</td>
                <td className="py-2 pr-4">{a.roleInProject}</td>
                <td className="py-2 pr-4">{a.allocationPercent}%</td>
                <td className="py-2 pr-4">{a.startDate}</td>
                <td className="py-2 pr-4">{a.endDate ?? 'Ongoing'}</td>
                <td className="py-2">
                  <button onClick={() => deactivate(a.id)}
                    className="text-red-500 text-xs hover:underline">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: admin allocations management page"
```

---

## Task 17: Admin Skills Page

**Files:**
- Create: `src/components/forms/SkillForm.tsx`
- Create: `src/lib/hooks/useSkills.ts`
- Modify: `src/app/admin/skills/page.tsx`

- [ ] **Step 1: Skills hooks**

```typescript
// src/lib/hooks/useSkills.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Skill } from '@/lib/types'

export function useSkillList(category?: string) {
  return useQuery({
    queryKey: ['skills', category],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill[]>('/api/skills', { params: category ? { category } : undefined })
      return data
    },
  })
}

export function useCreateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { name: string; category: string; description?: string }) => {
      const { data } = await apiClient.post<Skill>('/api/skills', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}

export function useUpdateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name: string; category: string; description?: string }) => {
      const { data } = await apiClient.patch<Skill>(`/api/skills/${id}`, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}

export function useDeleteSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/skills/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}
```

- [ ] **Step 2: Admin skills page** — table of skills with inline edit form + delete. Show "Skill is in use" when 409 is returned.

```tsx
// src/app/admin/skills/page.tsx
'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import { useSkillList, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/lib/hooks/useSkills'
import { useState } from 'react'
import type { Skill } from '@/lib/types'

export default function AdminSkillsPage() {
  const { data: skills } = useSkillList()
  const { mutate: create, isPending: creating } = useCreateSkill()
  const { mutate: update } = useUpdateSkill()
  const { mutate: del, error: deleteError } = useDeleteSkill()
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', category: '' })

  const deleteMsg = (deleteError as any)?.response?.data?.message

  return (
    <AdminGuard>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-xl font-semibold">Skills</h1>

        {/* Create form */}
        <form onSubmit={e => { e.preventDefault(); create({ name: newName, category: newCategory }, { onSuccess: () => { setNewName(''); setNewCategory('') } }) }}
          className="flex gap-2">
          <input placeholder="Skill name" value={newName} onChange={e => setNewName(e.target.value)}
            className="border rounded p-2 text-sm flex-1" required />
          <input placeholder="Category" value={newCategory} onChange={e => setNewCategory(e.target.value)}
            className="border rounded p-2 text-sm w-40" required />
          <button type="submit" disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">Add</button>
        </form>

        {deleteMsg && <p className="text-red-500 text-sm">{deleteMsg}</p>}

        <table className="w-full text-sm border-collapse">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Category</th><th className="py-2"></th>
          </tr></thead>
          <tbody>
            {skills?.map((skill: Skill) => (
              <tr key={skill.id} className="border-b">
                {editingId === skill.id ? (
                  <>
                    <td><input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="border rounded p-1 text-sm w-full" /></td>
                    <td><input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="border rounded p-1 text-sm w-full" /></td>
                    <td className="flex gap-2 py-2">
                      <button onClick={() => { update({ id: skill.id, ...editForm }, { onSuccess: () => setEditingId(null) }) }}
                        className="text-blue-600 text-xs">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 text-xs">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pr-4">{skill.name}</td>
                    <td className="py-2 pr-4 text-gray-500">{skill.category}</td>
                    <td className="py-2 flex gap-3">
                      <button onClick={() => { setEditingId(skill.id); setEditForm({ name: skill.name, category: skill.category }) }}
                        className="text-blue-600 text-xs hover:underline">Edit</button>
                      <button onClick={() => del(skill.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/
git commit -m "feat: admin skills management page"
```

---

## Task 18: Admin Dashboard Page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Dashboard API hook**

```typescript
// src/lib/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { DashboardData } from '@/lib/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>('/api/admin/dashboard')
      return data
    },
    staleTime: 30_000,
  })
}
```

- [ ] **Step 2: Dashboard page**

```tsx
// src/app/dashboard/page.tsx
'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import AllocationBar from '@/components/ui/AllocationBar'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useDashboard } from '@/lib/hooks/useDashboard'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  return (
    <AdminGuard>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {isLoading ? <p>Loading...</p> : data && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Active Employees</p>
                <p className="text-3xl font-bold">{data.totalActiveEmployees}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Avg Allocation</p>
                <p className="text-3xl font-bold">{Math.round(data.avgAllocationPercent)}%</p>
                <AllocationBar percent={data.avgAllocationPercent} />
              </div>
            </div>

            <section>
              <h2 className="font-medium mb-3">Available (next 30 days)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.availableEmployees.map(e => <EmployeeCard key={e.id} employee={e} />)}
              </div>
            </section>

            <section>
              <h2 className="font-medium mb-3">Most Allocated</h2>
              <div className="space-y-2">
                {data.topOverAllocated.map(({ employee, allocationPercent }) => (
                  <div key={employee.id} className="flex items-center gap-4 border rounded p-3">
                    <span className="text-sm font-medium w-40">{employee.fullName}</span>
                    <div className="flex-1"><AllocationBar percent={allocationPercent} /></div>
                    <span className="text-sm text-gray-500 w-12 text-right">{allocationPercent}%</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminGuard>
  )
}
```

- [ ] **Step 3: Run the complete system end-to-end**

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm run dev
```

Verify:
- [ ] Login as admin → dashboard shows metrics
- [ ] Navigate to /employees → see directory
- [ ] Create employee (admin)
- [ ] Login as employee → can edit own profile, cannot access /dashboard
- [ ] Admin creates allocation → cap enforcement shows 409 if over 100%

- [ ] **Step 4: Run all backend tests one final time**

```bash
cd backend && ./gradlew test
```
Expected: ALL PASS

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: admin dashboard page — workforce allocation system complete"
```

---

## NavBar (shared across all pages)

```tsx
// src/components/layout/NavBar.tsx
'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function NavBar() {
  const { user, logout, isAdmin } = useAuth()
  if (!user) return null
  return (
    <nav className="border-b px-6 py-3 flex items-center gap-6 bg-white">
      <Link href="/employees" className="font-semibold text-blue-600">Workforce</Link>
      <Link href="/employees" className="text-sm text-gray-600">Employees</Link>
      {isAdmin && <>
        <Link href="/dashboard" className="text-sm text-gray-600">Dashboard</Link>
        <Link href="/admin/allocations" className="text-sm text-gray-600">Allocations</Link>
        <Link href="/admin/skills" className="text-sm text-gray-600">Skills</Link>
      </>}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-gray-400">{user.email}</span>
        <button onClick={logout} className="text-sm text-red-500">Sign out</button>
      </div>
    </nav>
  )
}
```
