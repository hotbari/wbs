package com.company.workforce.api.project.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDate
import java.util.UUID

data class CreateTaskRequest(
    @field:NotBlank val title: String,
    val description: String? = null,
    val assigneeId: UUID? = null,
    val dueDate: LocalDate? = null
)
