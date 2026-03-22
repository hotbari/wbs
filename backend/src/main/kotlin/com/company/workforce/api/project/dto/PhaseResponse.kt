package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.Phase
import java.time.LocalDate
import java.util.UUID

data class PhaseResponse(
    val id: UUID,
    val projectId: UUID,
    val name: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val orderIndex: Int,
    val tasks: List<TaskResponse>
)

fun Phase.toResponse(tasks: List<TaskResponse>) =
    PhaseResponse(id, projectId, name, startDate, endDate, orderIndex, tasks)
