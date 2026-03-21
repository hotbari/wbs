package com.company.workforce.api.project.dto

import com.company.workforce.domain.project.ProjectStatus
import java.time.LocalDate

data class UpdateProjectRequest(
    val name: String? = null,
    val description: String? = null,
    val status: ProjectStatus? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null
)
