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
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class SidebarControllerTest : IntegrationTestBase() {

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
    }

    @Test
    fun `employee gets their active tasks`() {
        mvc.get("/api/me/tasks") {
            header("Authorization", "Bearer $employeeToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$") { isArray() }
        }
    }

    @Test
    fun `admin gets project health`() {
        mvc.get("/api/admin/projects/health") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$") { isArray() }
        }
    }

    @Test
    fun `employee cannot get project health`() {
        mvc.get("/api/admin/projects/health") {
            header("Authorization", "Bearer $employeeToken")
        }.andExpect { status { isForbidden() } }
    }

    private fun loginAndGetToken(email: String, password: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }
}
