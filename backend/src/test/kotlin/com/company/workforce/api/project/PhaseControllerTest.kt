package com.company.workforce.api.project

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.PhaseRepository
import com.company.workforce.domain.project.ProjectRepository
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
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class PhaseControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var projectRepository: ProjectRepository
    @Autowired lateinit var phaseRepository: PhaseRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String
    private lateinit var projectId: String

    @BeforeEach
    fun setup() {
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        val adminEmp = createEmployee(employeeRepository, email = "admin@test.com")
        createUser(userRepository, passwordEncoder, adminEmp.id, email = "admin@test.com", role = UserRole.ADMIN)
        adminToken = loginAndGetToken("admin@test.com", "Password1")
        projectId = createProject()
    }

    @Test
    fun `admin can create phase`() {
        mvc.post("/api/projects/$projectId/phases") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to "Phase 1", "startDate" to "2026-04-01",
                      "endDate" to "2026-04-30", "orderIndex" to 0)
            )
        }.andExpect { status { isCreated() } }
    }

    @Test
    fun `duplicate orderIndex in same project returns 409`() {
        createPhase(0)
        mvc.post("/api/projects/$projectId/phases") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to "Phase 2", "startDate" to "2026-05-01",
                      "endDate" to "2026-05-31", "orderIndex" to 0)
            )
        }.andExpect { status { isConflict() } }
    }

    @Test
    fun `delete phase without tasks returns 204`() {
        val phaseId = createPhase(0)
        mvc.delete("/api/phases/$phaseId") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect { status { isNoContent() } }
    }

    private fun createProject(): String {
        val resp = mvc.post("/api/projects") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("name" to "Test Project", "startDate" to "2026-04-01"))
        }.andReturn().response.contentAsString
        return objectMapper.readTree(resp)["id"].asText()
    }

    private fun createPhase(orderIndex: Int): String {
        val resp = mvc.post("/api/projects/$projectId/phases") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to "Phase $orderIndex", "startDate" to "2026-04-01",
                      "endDate" to "2026-04-30", "orderIndex" to orderIndex)
            )
        }.andReturn().response.contentAsString
        return objectMapper.readTree(resp)["id"].asText()
    }

    private fun loginAndGetToken(email: String, password: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }
}
