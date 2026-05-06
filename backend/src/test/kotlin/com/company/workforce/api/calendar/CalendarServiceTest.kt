package com.company.workforce.api.calendar

import com.company.workforce.IntegrationTestBase
import com.company.workforce.api.calendar.dto.*
import com.company.workforce.api.common.BadRequestException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
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
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.annotation.DirtiesContext
import java.time.Instant
import java.time.ZoneId
import java.util.UUID

@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CalendarServiceTest : IntegrationTestBase() {

    @Autowired lateinit var service: CalendarService
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

    private val t1 = Instant.parse("2026-05-06T01:00:00Z")
    private val t2 = Instant.parse("2026-05-06T02:00:00Z")

    @Test
    fun `create returns isMine true for the creator`() {
        val r = service.create(alice, CreateCalendarEventRequest(
            title = "Standup", startAt = t1, endAt = t2, isPublic = true,
        ))
        assertTrue(r.isMine)
        assertEquals("Alice", r.ownerName)
        assertEquals("A", r.ownerInitial)
    }

    @Test
    fun `getOne hides other private as 404`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "secret", startAt = t1, endAt = t2, isPublic = false,
        ))
        assertThrows(NotFoundException::class.java) { service.getOne(alice, ev.id) }
    }

    @Test
    fun `getOne shows other public as readonly`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "town hall", startAt = t1, endAt = t2, isPublic = true,
        ))
        val r = service.getOne(alice, ev.id)
        assertFalse(r.isMine)
        assertEquals("town hall", r.title)
    }

    @Test
    fun `update by other owner of public event returns 403`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "x", startAt = t1, endAt = t2, isPublic = true,
        ))
        assertThrows(ForbiddenException::class.java) {
            service.update(alice, ev.id, UpdateCalendarEventRequest(
                title = "hijack", startAt = t1, endAt = t2, isPublic = true,
            ))
        }
    }

    @Test
    fun `update by other owner of private event returns 404`() {
        val ev = service.create(bob, CreateCalendarEventRequest(
            title = "x", startAt = t1, endAt = t2, isPublic = false,
        ))
        assertThrows(NotFoundException::class.java) {
            service.update(alice, ev.id, UpdateCalendarEventRequest(
                title = "hijack", startAt = t1, endAt = t2, isPublic = false,
            ))
        }
    }

    @Test
    fun `delete by owner removes the event`() {
        val ev = service.create(alice, CreateCalendarEventRequest(
            title = "trash me", startAt = t1, endAt = t2,
        ))
        service.delete(alice, ev.id)
        assertTrue(repo.findById(ev.id).isEmpty)
    }

    @Test
    fun `allDay normalizes to KST midnight and exclusive end`() {
        val req = CreateCalendarEventRequest(
            title = "vacation",
            startAt = Instant.parse("2026-05-06T13:30:00Z"),
            endAt   = Instant.parse("2026-05-06T15:00:00Z"),
            allDay = true,
        )
        val r = service.create(alice, req)
        val kst = ZoneId.of("Asia/Seoul")
        assertEquals("2026-05-06T00:00", r.startAt.atZone(kst).toLocalDateTime().toString())
        assertEquals("2026-05-07T00:00", r.endAt.atZone(kst).toLocalDateTime().toString())
    }

    @Test
    fun `list with mine filter returns only owned`() {
        service.create(alice, CreateCalendarEventRequest(title = "a", startAt = t1, endAt = t2, isPublic = true))
        service.create(bob,   CreateCalendarEventRequest(title = "b", startAt = t1, endAt = t2, isPublic = true))
        val r = service.list(alice,
            Instant.parse("2026-05-06T00:00:00Z"),
            Instant.parse("2026-05-07T00:00:00Z"),
            CalendarFilter.MINE)
        assertEquals(1, r.size)
        assertEquals("a", r.first().title)
    }

    @Test
    fun `range over 92 days returns 400`() {
        val from = Instant.parse("2026-01-01T00:00:00Z")
        val to   = Instant.parse("2026-05-01T00:00:00Z")
        assertThrows(BadRequestException::class.java) {
            service.list(alice, from, to, CalendarFilter.ALL)
        }
    }
}
