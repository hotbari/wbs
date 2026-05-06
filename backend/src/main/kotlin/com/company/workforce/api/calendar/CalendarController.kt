package com.company.workforce.api.calendar

import com.company.workforce.api.calendar.dto.*
import com.company.workforce.security.UserDetailsImpl
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/calendar")
class CalendarController(private val service: CalendarService) {

    @GetMapping("/events")
    fun list(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @RequestParam from: Instant,
        @RequestParam to: Instant,
        @RequestParam(required = false, defaultValue = "ALL") filter: CalendarFilter,
    ): List<CalendarEventResponse> = service.list(principal.userId, from, to, filter)

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @Valid @RequestBody req: CreateCalendarEventRequest,
    ): CalendarEventResponse = service.create(principal.userId, req)

    @GetMapping("/events/{id}")
    fun get(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @PathVariable id: UUID,
    ): CalendarEventResponse = service.getOne(principal.userId, id)

    @PutMapping("/events/{id}")
    fun update(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @PathVariable id: UUID,
        @Valid @RequestBody req: UpdateCalendarEventRequest,
    ): CalendarEventResponse = service.update(principal.userId, id, req)

    @DeleteMapping("/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @AuthenticationPrincipal principal: UserDetailsImpl,
        @PathVariable id: UUID,
    ) = service.delete(principal.userId, id)
}
