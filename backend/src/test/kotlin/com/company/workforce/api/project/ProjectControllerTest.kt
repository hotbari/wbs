package com.company.workforce.api.project

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.ProjectRepository
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
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

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class ProjectControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var projectRepository: ProjectRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String
    private lateinit var employeeToken: String

    @BeforeEach
    fun setup() {
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()
        projectRepository.deleteAll()

        val adminEmp = createEmployee(employeeRepository, email = "admin@test.com")
        createUser(userRepository, passwordEncoder, adminEmp.id, email = "admin@test.com", role = UserRole.ADMIN)
        adminToken = loginAndGetToken("admin@test.com", "Password1")

        val empEmp = createEmployee(employeeRepository, email = "emp@test.com")
        createUser(userRepository, passwordEncoder, empEmp.id, email = "emp@test.com", role = UserRole.EMPLOYEE)
        employeeToken = loginAndGetToken("emp@test.com", "Password1")
    }

    @Test
    fun `any authenticated user can list projects`() {
        mvc.get("/api/projects") {
            header("Authorization", "Bearer $employeeToken")
        }.andExpect { status { isOk() } }
    }

    @Test
    fun `any authenticated user can get project detail`() {
        val id = createProject("Alpha")
        mvc.get("/api/projects/$id") {
            header("Authorization", "Bearer $employeeToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.name") { value("Alpha") }
        }
    }

    @Test
    fun `admin can create project`() {
        mvc.post("/api/projects") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to "Project X", "startDate" to "2026-04-01")
            )
        }.andExpect { status { isCreated() } }
    }

    @Test
    fun `employee cannot create project`() {
        mvc.post("/api/projects") {
            header("Authorization", "Bearer $employeeToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to "Project X", "startDate" to "2026-04-01")
            )
        }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `duplicate project name returns 409`() {
        createProject("Duplicate")
        mvc.post("/api/projects") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to "Duplicate", "startDate" to "2026-04-01")
            )
        }.andExpect { status { isConflict() } }
    }

    @Test
    fun `admin can archive project`() {
        val id = createProject("ToArchive")
        mvc.delete("/api/projects/$id") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.status") { value("ARCHIVED") }
        }
    }

    private fun createProject(name: String): String {
        val resp = mvc.post("/api/projects") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("name" to name, "startDate" to "2026-04-01")
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
