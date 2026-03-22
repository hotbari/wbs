package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.ProjectTask
import com.company.workforce.domain.project.TaskStatus
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class TaskResponse(
    val id: UUID,
    val phaseId: UUID,
    val title: String,
    val description: String?,
    val assigneeId: UUID?,
    val status: TaskStatus,
    val progressPercent: Int,
    val dueDate: LocalDate?,
    val createdAt: Instant
)

fun ProjectTask.toResponse() = TaskResponse(id, phaseId, title, description, assigneeId, status, progressPercent, dueDate, createdAt)
