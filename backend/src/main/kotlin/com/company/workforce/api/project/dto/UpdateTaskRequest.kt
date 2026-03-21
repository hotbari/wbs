package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.TaskStatus
import java.time.LocalDate
import java.util.UUID

data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val assigneeId: UUID? = null,
    val status: TaskStatus? = null,
    val progressPercent: Int? = null,
    val dueDate: LocalDate? = null
)
