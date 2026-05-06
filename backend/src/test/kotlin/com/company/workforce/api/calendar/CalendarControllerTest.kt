package com.company.workforce.api.calendar

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.calendar.CalendarEventRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.PhaseRepository
import com.company.workforce.domain.project.ProjectRepository
import com.company.workforce.domain.project.ProjectTaskRepository
import com.company.workforce.domain.project.TaskCommentRepository
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.user.UserRepository
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
import org.springframework.test.web.servlet.put

@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CalendarControllerTest : IntegrationTestBase() {

    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var om: ObjectMapper
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var calendarRepository: CalendarEventRepository
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var projectAssignmentRepository: ProjectAssignmentRepository
    @Autowired lateinit var taskCommentRepository: TaskCommentRepository
    @Autowired lateinit var projectTaskRepository: ProjectTaskRepository
    @Autowired lateinit var phaseRepository: PhaseRepository
    @Autowired lateinit var projectRepository: ProjectRepository
    @Autowired lateinit var employeeSkillRepository: EmployeeSkillRepository

    private lateinit var aliceToken: String
    private lateinit var bobToken: String

    @BeforeEach
    fun setup() {
        calendarRepository.deleteAll()
        refreshTokenRepository.deleteAll()
        projectAssignmentRepository.deleteAll()
        taskCommentRepository.deleteAll()
        projectTaskRepository.deleteAll()
        phaseRepository.deleteAll()
        projectRepository.deleteAll()
        employeeSkillRepository.deleteAll()
        userRepository.deleteAll()
        employeeRepository.deleteAll()

        val ae = createEmployee(employeeRepository, email = "alice@test.com", fullName = "Alice")
        val be = createEmployee(employeeRepository, email = "bob@test.com", fullName = "Bob")
        createUser(userRepository, passwordEncoder, ae.id, email = "alice@test.com")
        createUser(userRepository, passwordEncoder, be.id, email = "bob@test.com")
        aliceToken = login("alice@test.com")
        bobToken   = login("bob@test.com")
    }

    private fun login(email: String): String {
        val resp = mvc.post("/api/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(mapOf("email" to email, "password" to "Password1"))
        }.andReturn().response.contentAsString
        return om.readTree(resp)["accessToken"].asText()
    }

    private fun createEvent(token: String, body: Map<String, Any?>): String {
        val resp = mvc.post("/api/calendar/events") {
            header("Authorization", "Bearer $token")
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(body)
        }.andExpect { status { isCreated() } }.andReturn().response.contentAsString
        return om.readTree(resp)["id"].asText()
    }

    private val baseEvent = mapOf(
        "title" to "Meeting",
        "startAt" to "2026-05-06T01:00:00Z",
        "endAt"   to "2026-05-06T02:00:00Z",
    )

    @Test
    fun `unauthenticated GET returns 401`() {
        mvc.get("/api/calendar/events") {
            param("from", "2026-05-06T00:00:00Z")
            param("to",   "2026-05-07T00:00:00Z")
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `alice creates and lists own private event`() {
        createEvent(aliceToken, baseEvent + ("isPublic" to false))
        mvc.get("/api/calendar/events") {
            header("Authorization", "Bearer $aliceToken")
            param("from", "2026-05-06T00:00:00Z")
            param("to",   "2026-05-07T00:00:00Z")
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(1) }
            jsonPath("$[0].isMine") { value(true) }
        }
    }

    @Test
    fun `bob does not see alice's private event`() {
        createEvent(aliceToken, baseEvent + ("isPublic" to false))
        mvc.get("/api/calendar/events") {
            header("Authorization", "Bearer $bobToken")
            param("from", "2026-05-06T00:00:00Z")
            param("to",   "2026-05-07T00:00:00Z")
        }.andExpect {
            status { isOk() }
            jsonPath("$.length()") { value(0) }
        }
    }

    @Test
    fun `bob sees alice's public event but cannot edit`() {
        val id = createEvent(aliceToken, baseEvent + ("isPublic" to true))
        mvc.get("/api/calendar/events/$id") {
            header("Authorization", "Bearer $bobToken")
        }.andExpect {
            status { isOk() }
            jsonPath("$.isMine") { value(false) }
        }
        mvc.put("/api/calendar/events/$id") {
            header("Authorization", "Bearer $bobToken")
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(baseEvent + ("title" to "hijacked") + ("isPublic" to true))
        }.andExpect { status { isForbidden() } }
    }

    @Test
    fun `bob attempting to GET alice's private event returns 404`() {
        val id = createEvent(aliceToken, baseEvent + ("isPublic" to false))
        mvc.get("/api/calendar/events/$id") {
            header("Authorization", "Bearer $bobToken")
        }.andExpect { status { isNotFound() } }
    }

    @Test
    fun `delete by owner returns 204`() {
        val id = createEvent(aliceToken, baseEvent)
        mvc.delete("/api/calendar/events/$id") {
            header("Authorization", "Bearer $aliceToken")
        }.andExpect { status { isNoContent() } }
    }

    @Test
    fun `invalid range (end before start) returns 400`() {
        mvc.post("/api/calendar/events") {
            header("Authorization", "Bearer $aliceToken")
            contentType = MediaType.APPLICATION_JSON
            content = om.writeValueAsString(mapOf(
                "title" to "x",
                "startAt" to "2026-05-06T02:00:00Z",
                "endAt"   to "2026-05-06T01:00:00Z",
            ))
        }.andExpect { status { isBadRequest() } }
    }

    @Test
    fun `range over 92 days returns 400`() {
        mvc.get("/api/calendar/events") {
            header("Authorization", "Bearer $aliceToken")
            param("from", "2026-01-01T00:00:00Z")
            param("to",   "2026-05-01T00:00:00Z")
        }.andExpect { status { isBadRequest() } }
    }
}
