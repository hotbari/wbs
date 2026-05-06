package com.company.workforce.api.calendar

import com.company.workforce.api.calendar.dto.*
import com.company.workforce.api.common.BadRequestException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.domain.calendar.CalendarEvent
import com.company.workforce.domain.calendar.CalendarEventRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Service
class CalendarService(
    private val repo: CalendarEventRepository,
    private val userRepository: UserRepository,
    private val employeeRepository: EmployeeRepository,
) {
    private val kst: ZoneId = ZoneId.of("Asia/Seoul")
    private val maxRange: Duration = Duration.ofDays(92)

    @Transactional(readOnly = true)
    fun list(viewerId: UUID, from: Instant, to: Instant, filter: CalendarFilter): List<CalendarEventResponse> {
        if (Duration.between(from, to) > maxRange) {
            throw BadRequestException("Range exceeds 92 days")
        }
        val events = when (filter) {
            CalendarFilter.ALL    -> repo.findVisibleInRange(viewerId, from, to)
            CalendarFilter.MINE   -> repo.findByOwnerInRange(viewerId, from, to)
            CalendarFilter.PUBLIC -> repo.findPublicInRange(from, to)
        }
        return events.map { it.toResponse(viewerId) }
    }

    @Transactional
    fun create(viewerId: UUID, req: CreateCalendarEventRequest): CalendarEventResponse {
        val (start, end) = normalize(req.startAt, req.endAt, req.allDay)
        val saved = repo.save(CalendarEvent(
            ownerUserId = viewerId,
            title = req.title.trim(),
            description = req.description,
            location = req.location,
            startAt = start, endAt = end,
            allDay = req.allDay,
            isPublic = req.isPublic,
        ))
        return saved.toResponse(viewerId)
    }

    @Transactional(readOnly = true)
    fun getOne(viewerId: UUID, id: UUID): CalendarEventResponse {
        val ev = repo.findById(id).orElseThrow { NotFoundException("Event not found") }
        if (ev.ownerUserId != viewerId && !ev.isPublic) throw NotFoundException("Event not found")
        return ev.toResponse(viewerId)
    }

    @Transactional
    fun update(viewerId: UUID, id: UUID, req: UpdateCalendarEventRequest): CalendarEventResponse {
        val ev = repo.findById(id).orElseThrow { NotFoundException("Event not found") }
        if (ev.ownerUserId != viewerId) {
            if (!ev.isPublic) throw NotFoundException("Event not found")
            throw ForbiddenException("Only the owner can edit this event")
        }
        val (start, end) = normalize(req.startAt, req.endAt, req.allDay)
        ev.title = req.title.trim()
        ev.description = req.description
        ev.location = req.location
        ev.startAt = start
        ev.endAt = end
        ev.allDay = req.allDay
        ev.isPublic = req.isPublic
        ev.updatedAt = Instant.now()
        return ev.toResponse(viewerId)
    }

    @Transactional
    fun delete(viewerId: UUID, id: UUID) {
        val ev = repo.findById(id).orElseThrow { NotFoundException("Event not found") }
        if (ev.ownerUserId != viewerId) {
            if (!ev.isPublic) throw NotFoundException("Event not found")
            throw ForbiddenException("Only the owner can delete this event")
        }
        repo.delete(ev)
    }

    private fun normalize(start: Instant, end: Instant, allDay: Boolean): Pair<Instant, Instant> {
        if (!allDay) return start to end
        val startDate = start.atZone(kst).toLocalDate()
        val endDateExclusive = end.atZone(kst).toLocalDate().let { d ->
            // If end is already at midnight KST and represents an exclusive boundary, leave it; otherwise add 1 day.
            if (end.atZone(kst).toLocalTime() == java.time.LocalTime.MIDNIGHT && d.isAfter(startDate)) d
            else d.plusDays(1)
        }
        val s = startDate.atStartOfDay(kst).toInstant()
        val e = endDateExclusive.atStartOfDay(kst).toInstant()
        return s to e
    }

    private fun CalendarEvent.toResponse(viewerId: UUID): CalendarEventResponse {
        val user = userRepository.findById(ownerUserId).orElseThrow {
            NotFoundException("Owner user not found: $ownerUserId")
        }
        val emp = employeeRepository.findById(user.employeeId).orElseThrow {
            NotFoundException("Owner employee not found: ${user.employeeId}")
        }
        val name = emp.fullName
        val initial = name.firstOrNull { !it.isWhitespace() }?.toString() ?: "?"
        return CalendarEventResponse(
            id = id,
            ownerUserId = ownerUserId,
            ownerName = name,
            ownerInitial = initial,
            title = title,
            description = description,
            location = location,
            startAt = startAt,
            endAt = endAt,
            allDay = allDay,
            isPublic = isPublic,
            isMine = ownerUserId == viewerId,
        )
    }
}
