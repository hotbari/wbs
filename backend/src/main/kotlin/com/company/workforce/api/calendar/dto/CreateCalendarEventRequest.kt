package com.company.workforce.api.calendar.dto

import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant

data class CreateCalendarEventRequest(
    @field:NotBlank @field:Size(max = 200) val title: String,
    @field:Size(max = 2000) val description: String? = null,
    @field:Size(max = 200) val location: String? = null,
    val startAt: Instant,
    val endAt: Instant,
    val allDay: Boolean = false,
    val isPublic: Boolean = false,
) {
    @AssertTrue(message = "endAt must be on or after startAt")
    fun isRangeValid(): Boolean = !endAt.isBefore(startAt)
}
