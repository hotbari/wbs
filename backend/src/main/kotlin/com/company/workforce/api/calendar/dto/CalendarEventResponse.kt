package com.company.workforce.api.calendar.dto

import java.time.Instant
import java.util.UUID

data class CalendarEventResponse(
    val id: UUID,
    val ownerUserId: UUID,
    val ownerName: String,
    val ownerInitial: String,
    val title: String,
    val description: String?,
    val location: String?,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean,
    val isPublic: Boolean,
    val isMine: Boolean,
)
