package com.company.workforce.api.allocation.dto

import java.time.LocalDate
import java.util.UUID

data class AllocationResponse(
    val id: UUID,
    val employeeId: UUID,
    val projectName: String,
    val roleInProject: String,
    val allocationPercent: Int,
    val startDate: LocalDate,
    val endDate: LocalDate?,
    val isActive: Boolean
)
