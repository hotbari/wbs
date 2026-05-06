package com.company.workforce.domain.calendar

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "calendar_events")
class CalendarEvent(
    @Id val id: UUID = UUID.randomUUID(),
    val ownerUserId: UUID,
    var title: String,
    var description: String? = null,
    var location: String? = null,
    var startAt: Instant,
    var endAt: Instant,
    var allDay: Boolean = false,
    var isPublic: Boolean = false,
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now()
)
