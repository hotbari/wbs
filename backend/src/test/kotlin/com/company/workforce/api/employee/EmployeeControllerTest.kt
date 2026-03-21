package com.company.workforce.api.employee

import com.company.workforce.IntegrationTestBase
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
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class EmployeeControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String

    @BeforeEach
    fun setup() {
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()
        adminToken = createAdminAndGetToken()
    }

    private fun createAdminAndGetToken(): String {
        val email = "admin@test.com"
        val password = "Password1"
        val emp = createEmployee(employeeRepository, email = email, fullName = "Admin User")
        createUser(userRepository, passwordEncoder, emp.id, email = email, password = password, role = UserRole.ADMIN)
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andExpect { status { isOk() } }
         .andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }

    private fun createEmployeeAndGetToken(email: String): String {
        val password = "Password1"
        val emp = createEmployee(employeeRepository, email = email, fullName = "Employee $email")
        createUser(userRepository, passwordEncoder, emp.id, email = email, password = password, role = UserRole.EMPLOYEE)
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andExpect { status { isOk() } }
         .andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
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
            "fullName" to "Bob Smith",
            "email" to "bob@test.com",
            "password" to "Password1",
            "department" to "Engineering",
            "jobTitle" to "Developer",
            "employmentType" to "FULL_TIME",
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
        val body = mapOf(
            "fullName" to "Bob Smith",
            "email" to "admin@test.com",
            "password" to "Password1",
            "department" to "Engineering",
            "jobTitle" to "Developer",
            "employmentType" to "FULL_TIME",
            "hiredAt" to "2024-01-15"
        )
        mvc.post("/api/employees") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isConflict() }
        }
    }

    @Test
    fun `employee cannot patch another employee`() {
        // Create a second employee to be the target
        val targetEmp = createEmployee(employeeRepository, email = "target@test.com", fullName = "Target Employee")

        // Create another employee (not admin) and get their token
        val employeeToken = createEmployeeAndGetToken("another@test.com")

        val body = mapOf("fullName" to "Hacked Name")
        mvc.patch("/api/employees/${targetEmp.id}") {
            header("Authorization", "Bearer $employeeToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andExpect {
            status { isForbidden() }
        }
    }
}
