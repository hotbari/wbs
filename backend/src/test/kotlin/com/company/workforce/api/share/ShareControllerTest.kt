package com.company.workforce.api.share

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.PhaseRepository
import com.company.workforce.domain.project.ProjectRepository
import com.company.workforce.domain.project.ProjectTaskRepository
import com.company.workforce.domain.project.TaskCommentRepository
import com.company.workforce.domain.share.ShareToken
import com.company.workforce.domain.share.ShareTokenRepository
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.time.LocalDateTime
import java.util.UUID

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class ShareControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository
    @Autowired lateinit var shareTokenRepository: ShareTokenRepository
    @Autowired lateinit var assignmentRepository: ProjectAssignmentRepository
    @Autowired lateinit var employeeSkillRepository: EmployeeSkillRepository
    @Autowired lateinit var commentRepository: TaskCommentRepository
    @Autowired lateinit var taskRepository: ProjectTaskRepository
    @Autowired lateinit var phaseRepository: PhaseRepository
    @Autowired lateinit var projectRepository: ProjectRepository

    private lateinit var adminToken: String
    private lateinit var employeeId: String

    @BeforeEach
    fun setup() {
        shareTokenRepository.deleteAll()
        refreshTokenRepository.deleteAll()
        assignmentRepository.deleteAll()
        employeeSkillRepository.deleteAll()
        commentRepository.deleteAll()
        taskRepository.deleteAll()
        phaseRepository.deleteAll()
        projectRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        // Create admin
        val adminEmp = createEmployee(employeeRepository, email = "admin@test.com", fullName = "Admin User")
        createUser(userRepository, passwordEncoder, adminEmp.id, email = "admin@test.com", password = "Password1", role = UserRole.ADMIN)
        adminToken = loginAndGetToken("admin@test.com", "Password1")

        // Create a target employee (no user account needed for share link creation)
        val targetEmp = createEmployee(employeeRepository, email = "emp@test.com", fullName = "Target Employee")
        employeeId = targetEmp.id.toString()
    }

    private fun loginAndGetToken(email: String, password: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andExpect { status { isOk() } }
            .andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }

    @Test
    fun `admin can create share link`() {
        mvc.post("/api/employees/$employeeId/share") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.token") { exists() }
            jsonPath("$.url") { exists() }
            jsonPath("$.expiresAt") { exists() }
        }
    }

    @Test
    fun `employee cannot create share link`() {
        // Create an employee user
        val empEmp = createEmployee(employeeRepository, email = "regular@test.com", fullName = "Regular Employee")
        createUser(userRepository, passwordEncoder, empEmp.id, email = "regular@test.com", password = "Password1", role = UserRole.EMPLOYEE)
        val empToken = loginAndGetToken("regular@test.com", "Password1")

        mvc.post("/api/employees/$employeeId/share") {
            header("Authorization", "Bearer $empToken")
        }.andExpect {
            status { isForbidden() }
        }
    }

    @Test
    fun `public GET returns employee name and allocations without auth`() {
        // Create a share token via the admin API
        val createResp = mvc.post("/api/employees/$employeeId/share") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect { status { isOk() } }
            .andReturn().response.contentAsString
        val token = objectMapper.readTree(createResp)["token"].asText()

        mvc.get("/api/share/$token")
            .andExpect {
                status { isOk() }
                jsonPath("$.fullName") { value("Target Employee") }
                jsonPath("$.allocations") { exists() }
            }
    }

    @Test
    fun `unknown token returns 404`() {
        val randomToken = UUID.randomUUID()

        mvc.get("/api/share/$randomToken")
            .andExpect {
                status { isNotFound() }
            }
    }

    @Test
    fun `expired token returns 404`() {
        // Save an already-expired token directly into the repository
        val targetEmpId = UUID.fromString(employeeId)
        val expiredToken = shareTokenRepository.save(
            ShareToken(
                employeeId = targetEmpId,
                expiresAt = LocalDateTime.now().minusDays(1)
            )
        )

        mvc.get("/api/share/${expiredToken.token}")
            .andExpect {
                status { isNotFound() }
            }
    }
}
