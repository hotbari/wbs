package com.company.workforce.api.project.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDate

data class CreateProjectRequest(
    @field:NotBlank val name: String,
    val description: String? = null,
    val startDate: LocalDate,
    val endDate: LocalDate? = null
)
