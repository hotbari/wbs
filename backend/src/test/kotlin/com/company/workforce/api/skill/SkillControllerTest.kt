package com.company.workforce.api.skill

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.skill.SkillRepository
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

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class SkillControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var skillRepository: SkillRepository
    @Autowired lateinit var employeeSkillRepository: EmployeeSkillRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository

    private lateinit var adminToken: String

    @BeforeEach
    fun setup() {
        employeeSkillRepository.deleteAll()
        skillRepository.deleteAll()
        refreshTokenRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()
        adminToken = createAdminAndGetToken(mvc, objectMapper, employeeRepository, userRepository, passwordEncoder)
    }

    private fun createAdminAndGetToken(
        mvc: MockMvc,
        objectMapper: ObjectMapper,
        employeeRepository: EmployeeRepository,
        userRepository: UserRepository,
        passwordEncoder: PasswordEncoder
    ): String {
        val email = "admin@test.com"
        val password = "Password1"
        val emp = createEmployee(employeeRepository, email = email, fullName = "Admin User")
        createUser(userRepository, passwordEncoder, emp.id, email = email, password = password, role = UserRole.ADMIN)
        return loginAndGetToken(mvc, objectMapper, email, password)
    }

    private fun loginAndGetToken(mvc: MockMvc, objectMapper: ObjectMapper, email: String, password: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("email" to email, "password" to password))
        }.andExpect { status { isOk() } }
            .andReturn().response
        return objectMapper.readTree(resp.contentAsString)["accessToken"].asText()
    }

    @Test
    fun `admin can create a skill`() {
        mvc.post("/api/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Kotlin","category":"Backend"}"""
        }.andExpect {
            status { isCreated() }
            jsonPath("$.name") { value("Kotlin") }
        }
    }

    @Test
    fun `duplicate skill name returns 409`() {
        // Create skill once
        mvc.post("/api/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Java","category":"Backend"}"""
        }
        // Create same skill again
        mvc.post("/api/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Java","category":"Backend"}"""
        }.andExpect {
            status { isConflict() }
        }
    }

    @Test
    fun `employee can add skill to own profile`() {
        // Create a skill first (as admin)
        val skillResponse = mvc.post("/api/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Python","category":"Backend"}"""
        }.andReturn().response.contentAsString
        val skillId = objectMapper.readTree(skillResponse).get("id").asText()

        // Create an employee
        val empBody = mapOf(
            "fullName" to "Employee One", "email" to "emp1@test.com",
            "password" to "Password1", "department" to "Engineering",
            "jobTitle" to "Dev", "employmentType" to "FULL_TIME", "hiredAt" to "2024-01-01"
        )
        val empResponse = mvc.post("/api/employees") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(empBody)
        }.andReturn().response.contentAsString
        val empId = objectMapper.readTree(empResponse).get("id").asText()

        // Get employee token
        val empToken = loginAndGetToken(mvc, objectMapper, "emp1@test.com", "Password1")

        // Employee adds skill to own profile
        mvc.post("/api/employees/$empId/skills") {
            header("Authorization", "Bearer $empToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"skillId":"$skillId","proficiency":"BEGINNER"}"""
        }.andExpect {
            status { isCreated() }
        }
    }

    @Test
    fun `employee cannot add skill to another employee`() {
        // Create a skill
        val skillResponse = mvc.post("/api/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"Go","category":"Backend"}"""
        }.andReturn().response.contentAsString
        val skillId = objectMapper.readTree(skillResponse).get("id").asText()

        // Create two employees
        val emp1Body = mapOf("fullName" to "Emp A", "email" to "empa@test.com",
            "password" to "Password1", "department" to "Eng", "jobTitle" to "Dev",
            "employmentType" to "FULL_TIME", "hiredAt" to "2024-01-01")
        val emp2Body = mapOf("fullName" to "Emp B", "email" to "empb@test.com",
            "password" to "Password1", "department" to "Eng", "jobTitle" to "Dev",
            "employmentType" to "FULL_TIME", "hiredAt" to "2024-01-01")

        mvc.post("/api/employees") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(emp1Body)
        }
        val emp2Response = mvc.post("/api/employees") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(emp2Body)
        }.andReturn().response.contentAsString
        val emp2Id = objectMapper.readTree(emp2Response).get("id").asText()

        // Employee A tries to add skill to Employee B's profile → 403
        val emp1Token = loginAndGetToken(mvc, objectMapper, "empa@test.com", "Password1")
        mvc.post("/api/employees/$emp2Id/skills") {
            header("Authorization", "Bearer $emp1Token")
            contentType = MediaType.APPLICATION_JSON
            content = """{"skillId":"$skillId","proficiency":"BEGINNER"}"""
        }.andExpect {
            status { isForbidden() }
        }
    }

    @Test
    fun `cannot delete skill in use`() {
        // Create skill and employee, assign skill
        val skillResponse = mvc.post("/api/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"name":"TypeScript","category":"Frontend"}"""
        }.andReturn().response.contentAsString
        val skillId = objectMapper.readTree(skillResponse).get("id").asText()

        val empBody = mapOf("fullName" to "Emp C", "email" to "empc@test.com",
            "password" to "Password1", "department" to "Eng", "jobTitle" to "Dev",
            "employmentType" to "FULL_TIME", "hiredAt" to "2024-01-01")
        val empResponse = mvc.post("/api/employees") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(empBody)
        }.andReturn().response.contentAsString
        val empId = objectMapper.readTree(empResponse).get("id").asText()

        // Assign skill to employee (as admin)
        mvc.post("/api/employees/$empId/skills") {
            header("Authorization", "Bearer $adminToken")
            contentType = MediaType.APPLICATION_JSON
            content = """{"skillId":"$skillId","proficiency":"EXPERT"}"""
        }

        // Try to delete skill in use → 409
        mvc.delete("/api/skills/$skillId") {
            header("Authorization", "Bearer $adminToken")
        }.andExpect {
            status { isConflict() }
        }
    }
}
