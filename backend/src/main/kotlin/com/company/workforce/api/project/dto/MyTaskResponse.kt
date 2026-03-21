package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.TaskStatus
import java.time.LocalDate
import java.util.UUID

data class ProjectRef(val id: UUID, val name: String)
data class PhaseRef(val id: UUID, val name: String)

data class MyTaskResponse(
    val id: UUID,
    val title: String,
    val status: TaskStatus,
    val progressPercent: Int,
    val dueDate: LocalDate?,
    val project: ProjectRef,
    val phase: PhaseRef
)
