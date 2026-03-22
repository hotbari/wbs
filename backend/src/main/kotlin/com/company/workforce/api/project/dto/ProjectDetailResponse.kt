package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.ProjectStatus
import java.time.LocalDate
import java.util.UUID

data class ProjectDetailResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val status: ProjectStatus,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val phases: List<PhaseResponse>
)
