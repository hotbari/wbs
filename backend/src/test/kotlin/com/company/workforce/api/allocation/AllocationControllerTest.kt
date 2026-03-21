package com.company.workforce.api.allocation

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.employee.EmployeeRepository
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
import org.springframework.test.web.servlet.post
import java.util.UUID

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AllocationControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var assignmentRepository: ProjectAssignmentRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String
    private lateinit var employeeId: UUID

    @BeforeEach
    fun setup() {
        assignmentRepository.deleteAll()
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        adminToken = createAdminAndGetToken()

        val emp = createEmployee(employeeRepository, email = "worker@test.com")
        employeeId = emp.id
        createUser(userRepository, passwordEncoder, emp.id, email = "worker@test.com", role = UserRole.EMPLOYEE)
    }

    @Test
    fun `admin can create allocation`() {
        mvc.post("/api/allocations") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf(
                    "employeeId" to employeeId.toString(),
                    "projectName" to "Project X",
                    "roleInProject" to "Developer",
                    "allocationPercent" to 60,
                    "startDate" to "2026-01-01"
                )
            )
        }.andExpect {
            status { isCreated() }
        }
    }

    @Test
    fun `creating allocation that exceeds 100 percent returns 409`() {
        createAllocation(60)
        mvc.post("/api/allocations") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf(
                    "employeeId" to employeeId.toString(),
                    "projectName" to "Project Y",
                    "roleInProject" to "Developer",
                    "allocationPercent" to 50,
                    "startDate" to "2026-01-01"
                )
            )
        }.andExpect {
            status { isConflict() }
        }
    }

    @Test
    fun `soft delete sets isActive to false`() {
        val id = createAllocationAndGetId(60)
        mvc.delete("/api/allocations/$id") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect { status { isNoContent() } }
        val assignment = assignmentRepository.findById(id).get()
        assertThat(assignment.isActive).isFalse()
    }

    private fun createAdminAndGetToken(): String {
        val email = "admin@test.com"
        val password = "Password1"
        val emp = createEmployee(employeeRepository, email = email, fullName = "Admin User")
        createUser(userRepository, passwordEncoder, emp.id, email = email, password = password, role = UserRole.ADMIN)
        return loginAndGetToken(email, password)
    }

    private fun loginAndGetToken(email: String, password: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andExpect { status { isOk() } }
            .andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }

    private fun createAllocation(percent: Int): String {
        val body = mapOf(
            "employeeId" to employeeId.toString(),
            "projectName" to "Project X",
            "roleInProject" to "Developer",
            "allocationPercent" to percent,
            "startDate" to "2026-01-01"
        )
        return mvc.post("/api/allocations") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(body)
        }.andReturn().response.contentAsString
    }

    private fun createAllocationAndGetId(percent: Int): UUID {
        val response = createAllocation(percent)
        return UUID.fromString(objectMapper.readTree(response).get("id").asText())
    }
}
