package com.company.workforce.api.allocation.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDate
import java.util.UUID

data class CreateAllocationRequest(
    val employeeId: UUID,
    @field:NotBlank val projectName: String,
    @field:NotBlank val roleInProject: String,
    @field:Min(1) @field:Max(100) val allocationPercent: Int,
    val startDate: LocalDate,
    val endDate: LocalDate? = null
)
