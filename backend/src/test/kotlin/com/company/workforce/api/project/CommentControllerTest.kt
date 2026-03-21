package com.company.workforce.api.project

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.*
import com.company.workforce.domain.auth.RefreshTokenRepository
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
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.util.UUID

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CommentControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var projectRepository: ProjectRepository
    @Autowired lateinit var phaseRepository: PhaseRepository
    @Autowired lateinit var taskRepository: ProjectTaskRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String
    private lateinit var employeeToken: String
    private lateinit var otherToken: String
    private lateinit var taskId: UUID

    @BeforeEach
    fun setup() {
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        val adminEmp = createEmployee(employeeRepository, email = "admin@test.com")
        createUser(userRepository, passwordEncoder, adminEmp.id, email = "admin@test.com", role = UserRole.ADMIN)
        adminToken = loginAndGetToken("admin@test.com", "Password1")

        val empEmp = createEmployee(employeeRepository, email = "emp@test.com")
        createUser(userRepository, passwordEncoder, empEmp.id, email = "emp@test.com", role = UserRole.EMPLOYEE)
        employeeToken = loginAndGetToken("emp@test.com", "Password1")

        val otherEmp = createEmployee(employeeRepository, email = "other@test.com")
        createUser(userRepository, passwordEncoder, otherEmp.id, email = "other@test.com", role = UserRole.EMPLOYEE)
        otherToken = loginAndGetToken("other@test.com", "Password1")

        val project = projectRepository.save(
            Project(name = "Project", startDate = java.time.LocalDate.of(2026, 4, 1), createdBy = adminEmp.id)
        )
        val phase = phaseRepository.save(
            Phase(projectId = project.id, name = "P1",
                startDate = java.time.LocalDate.of(2026, 4, 1),
                endDate = java.time.LocalDate.of(2026, 4, 30), orderIndex = 0)
        )
        val task = taskRepository.save(ProjectTask(phaseId = phase.id, title = "T1"))
        taskId = task.id
    }

    @Test
    fun `any authenticated user can get comments`() {
        mvc.get("/api/tasks/$taskId/comments") {
            header("Authorization", "Bearer $employeeToken")
        }.andExpect { status { isOk() } }
    }

    @Test
    fun `any authenticated user can post comment`() {
        mvc.post("/api/tasks/$taskId/comments") {
            header("Authorization", "Bearer $employeeToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("body" to "Great work!"))
        }.andExpect { status { isCreated() } }
    }

    @Test
    fun `author can delete own comment`() {
        val commentId = createComment(employeeToken)
        mvc.delete("/api/comments/$commentId") {
            header("Authorization", "Bearer $employeeToken")
        }.andExpect { status { isNoContent() } }
    }

    @Test
    fun `user cannot delete another users comment`() {
        val commentId = createComment(employeeToken)
        mvc.delete("/api/comments/$commentId") {
            header("Authorization", "Bearer $otherToken")
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `admin can delete any comment`() {
        val commentId = createComment(employeeToken)
        mvc.delete("/api/comments/$commentId") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect { status { isNoContent() } }
    }

    private fun createComment(token: String): UUID {
        val resp = mvc.post("/api/tasks/$taskId/comments") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("body" to "A comment"))
        }.andReturn().response.contentAsString
        return UUID.fromString(objectMapper.readTree(resp)["id"].asText())
    }

    private fun loginAndGetToken(email: String, password: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }
}
