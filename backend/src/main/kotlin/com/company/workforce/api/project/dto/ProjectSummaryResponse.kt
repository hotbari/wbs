package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.ProjectStatus
import java.time.LocalDate
import java.util.UUID

data class ProjectSummaryResponse(
    val id: UUID,
    val name: String,
    val status: ProjectStatus,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val phaseCount: Int,
    val taskCount: Long
)
