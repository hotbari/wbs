package com.company.workforce.api.admin

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.employee.EmployeeRepository
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
class AdminControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var assignmentRepository: ProjectAssignmentRepository
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String
    private lateinit var employeeToken: String

    @BeforeEach
    fun setup() {
        assignmentRepository.deleteAll()
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        adminToken = createAdminAndGetToken()
        employeeToken = createEmployeeAndGetToken()
    }

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

    private fun loginAndGetToken(email: String, password: String): String {
        val response = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email":"$email","password":"$password"}"""
        }.andReturn().response.contentAsString
        return objectMapper.readTree(response).get("accessToken").asText()
    }

    private fun createAdminAndGetToken(): String {
        val emp = createEmployee(employeeRepository, email = "admin@test.com", fullName = "Admin User")
        createUser(userRepository, passwordEncoder, emp.id, email = "admin@test.com", role = UserRole.ADMIN)
        return loginAndGetToken("admin@test.com", "Password1")
    }

    private fun createEmployeeAndGetToken(): String {
        val emp = createEmployee(employeeRepository, email = "employee@test.com", fullName = "Employee User")
        createUser(userRepository, passwordEncoder, emp.id, email = "employee@test.com", role = UserRole.EMPLOYEE)
        return loginAndGetToken("employee@test.com", "Password1")
    }
}
