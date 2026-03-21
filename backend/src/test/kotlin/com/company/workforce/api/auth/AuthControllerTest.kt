package com.company.workforce.api.auth

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
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
import org.springframework.test.web.servlet.post

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AuthControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder

    @BeforeEach
    fun setup() {
        userRepository.deleteAll()
        employeeRepository.deleteAll()
        val emp = createEmployee(employeeRepository, email = "alice@test.com", fullName = "Alice")
        createUser(userRepository, passwordEncoder, emp.id, email = "alice@test.com", password = "Password1")
    }

    @Test
    fun `login with valid credentials returns access token and sets refresh cookie`() {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("email" to "alice@test.com", "password" to "Password1")
            )
        }.andExpect { status { isOk() } }
         .andReturn().response

        val body = objectMapper.readTree(resp.contentAsString)
        assertThat(body["accessToken"].asText()).isNotBlank()
        assertThat(resp.getCookie("refreshToken")).isNotNull()
    }

    @Test
    fun `login with wrong password returns 401`() {
        mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(
                mapOf("email" to "alice@test.com", "password" to "wrong")
            )
        }.andExpect { status { isUnauthorized() } }
    }
}
