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
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post
import java.util.UUID

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class TaskControllerTest : IntegrationTestBase() {

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
    private lateinit var phaseId: UUID
    private lateinit var assignedEmployeeId: UUID

    @BeforeEach
    fun setup() {
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        val adminEmp = createEmployee(employeeRepository, email = "admin@test.com")
        createUser(userRepository, passwordEncoder, adminEmp.id, email = "admin@test.com", role = UserRole.ADMIN)
        adminToken = loginAndGetToken("admin@test.com", "Password1")

        val empEmp = createEmployee(employeeRepository, email = "emp@test.com")
        assignedEmployeeId = empEmp.id
        createUser(userRepository, passwordEncoder, empEmp.id, email = "emp@test.com", role = UserRole.EMPLOYEE)
        employeeToken = loginAndGetToken("emp@test.com", "Password1")

        val project = projectRepository.save(
            com.company.workforce.domain.project.Project(
                name = "Test Project", startDate = java.time.LocalDate.of(2026, 4, 1),
                createdBy = adminEmp.id
            )
        )
        val phase = phaseRepository.save(
            Phase(projectId = project.id, name = "Phase 1",
                startDate = java.time.LocalDate.of(2026, 4, 1),
                endDate = java.time.LocalDate.of(2026, 4, 30), orderIndex = 0)
        )
        phaseId = phase.id
    }

    @Test
    fun `admin can create task`() {
        mvc.post("/api/phases/$phaseId/tasks") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("title" to "Do something"))
        }.andExpect { status { isCreated() } }
    }

    @Test
    fun `employee can update status on own task`() {
        val taskId = createTask(assignedEmployeeId)
        mvc.patch("/api/tasks/$taskId") {
            header("Authorization", "Bearer $employeeToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("status" to "IN_PROGRESS", "progressPercent" to 30))
        }.andExpect {
            status { isOk() }
            jsonPath("$.status") { value("IN_PROGRESS") }
        }
    }

    @Test
    fun `employee cannot update title on own task`() {
        val taskId = createTask(assignedEmployeeId)
        mvc.patch("/api/tasks/$taskId") {
            header("Authorization", "Bearer $employeeToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("title" to "Hacked title"))
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `employee cannot update another employee task`() {
        val taskId = createTask(null) // unassigned
        mvc.patch("/api/tasks/$taskId") {
            header("Authorization", "Bearer $employeeToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("status" to "IN_PROGRESS"))
        }.andExpect { status { isUnauthorized() } }
    }

    private fun createTask(assigneeId: UUID?): UUID {
        val body = mutableMapOf<String, Any>("title" to "Test Task")
        assigneeId?.let { body["assigneeId"] = it.toString() }
        val resp = mvc.post("/api/phases/$phaseId/tasks") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
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
