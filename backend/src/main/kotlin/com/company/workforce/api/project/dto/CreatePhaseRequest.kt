package com.company.workforce.api.project.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDate

data class CreatePhaseRequest(
    @field:NotBlank val name: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val orderIndex: Int
)
