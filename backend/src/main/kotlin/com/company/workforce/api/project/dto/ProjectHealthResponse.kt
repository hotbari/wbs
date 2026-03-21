package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.ProjectStatus
import java.util.UUID

data class ProjectHealthResponse(
    val id: UUID,
    val name: String,
    val status: ProjectStatus,
    val phaseCount: Int,
    val totalTaskCount: Long,
    val inProgressTaskCount: Long,
    val overdueTaskCount: Long,
    val completionPercent: Double
)
