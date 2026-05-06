package com.company.workforce.domain.calendar

import com.company.workforce.IntegrationTestBase
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.PhaseRepository
import com.company.workforce.domain.project.ProjectRepository
import com.company.workforce.domain.project.ProjectTaskRepository
import com.company.workforce.domain.project.TaskCommentRepository
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.DirtiesContext
import java.time.Instant
import java.util.UUID

@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CalendarEventRepositoryTest : IntegrationTestBase() {

    @Autowired lateinit var repo: CalendarEventRepository
    @Autowired lateinit var userRepository: UserRepository
    @Autowired lateinit var employeeRepository: EmployeeRepository
    @Autowired lateinit var passwordEncoder: PasswordEncoder
    @Autowired lateinit var refreshTokenRepository: RefreshTokenRepository
    @Autowired lateinit var projectAssignmentRepository: ProjectAssignmentRepository
    @Autowired lateinit var taskCommentRepository: TaskCommentRepository
    @Autowired lateinit var projectTaskRepository: ProjectTaskRepository
    @Autowired lateinit var phaseRepository: PhaseRepository
    @Autowired lateinit var projectRepository: ProjectRepository
    @Autowired lateinit var employeeSkillRepository: EmployeeSkillRepository

    private lateinit var alice: UUID
    private lateinit var bob: UUID

    @BeforeEach
    fun setup() {
        repo.deleteAll()
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
        alice = createUser(userRepository, passwordEncoder, ae.id, email = "alice@test.com").id
        bob   = createUser(userRepository, passwordEncoder, be.id, email = "bob@test.com").id
    }

    private fun event(
        owner: UUID, start: String, end: String, isPublic: Boolean = false, title: String = "e"
    ) = repo.save(CalendarEvent(
        ownerUserId = owner, title = title,
        startAt = Instant.parse(start), endAt = Instant.parse(end),
        isPublic = isPublic,
    ))

    @Test
    fun `findVisibleInRange returns own private and any public, hides other private`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = false, title = "alice-private")
        event(alice, "2026-05-06T03:00:00Z", "2026-05-06T04:00:00Z", isPublic = true,  title = "alice-public")
        event(bob,   "2026-05-06T05:00:00Z", "2026-05-06T06:00:00Z", isPublic = false, title = "bob-private")
        event(bob,   "2026-05-06T07:00:00Z", "2026-05-06T08:00:00Z", isPublic = true,  title = "bob-public")

        val asAlice = repo.findVisibleInRange(
            alice, Instant.parse("2026-05-06T00:00:00Z"), Instant.parse("2026-05-07T00:00:00Z")
        ).map { it.title }.toSet()

        assertEquals(setOf("alice-private", "alice-public", "bob-public"), asAlice)
    }

    @Test
    fun `range overlap is half-open (touching boundary excludes adjacent event)`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = true)
        val res = repo.findVisibleInRange(
            alice, Instant.parse("2026-05-06T02:00:00Z"), Instant.parse("2026-05-06T03:00:00Z")
        )
        assertTrue(res.isEmpty(), "Event ending at the range start must not be returned")
    }

    @Test
    fun `multi-day event spanning the queried range is returned`() {
        event(alice, "2026-05-01T00:00:00Z", "2026-05-10T00:00:00Z", isPublic = false, title = "vacation")
        val res = repo.findVisibleInRange(
            alice, Instant.parse("2026-05-05T00:00:00Z"), Instant.parse("2026-05-06T00:00:00Z")
        ).map { it.title }
        assertEquals(listOf("vacation"), res)
    }

    @Test
    fun `findByOwnerInRange returns only that owner`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = true)
        event(bob,   "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = true)
        val res = repo.findByOwnerInRange(
            alice, Instant.parse("2026-05-06T00:00:00Z"), Instant.parse("2026-05-07T00:00:00Z")
        )
        assertEquals(1, res.size)
        assertEquals(alice, res.first().ownerUserId)
    }

    @Test
    fun `findPublicInRange excludes private events`() {
        event(alice, "2026-05-06T01:00:00Z", "2026-05-06T02:00:00Z", isPublic = false)
        event(bob,   "2026-05-06T03:00:00Z", "2026-05-06T04:00:00Z", isPublic = true,  title = "bob-public")
        val res = repo.findPublicInRange(
            Instant.parse("2026-05-06T00:00:00Z"), Instant.parse("2026-05-07T00:00:00Z")
        ).map { it.title }
        assertEquals(listOf("bob-public"), res)
    }
}
