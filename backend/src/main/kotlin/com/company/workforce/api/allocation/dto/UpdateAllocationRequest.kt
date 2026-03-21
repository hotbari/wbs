package com.company.workforce.api.allocation.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import java.time.LocalDate

data class UpdateAllocationRequest(
    val projectName: String? = null,
    val roleInProject: String? = null,
    @field:Min(1) @field:Max(100) val allocationPercent: Int? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val isActive: Boolean? = null
)
