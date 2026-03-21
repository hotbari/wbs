package com.company.workforce.api.employee.dto

import java.util.UUID

data class EmployeeSummary(
    val id: UUID,
    val fullName: String,
    val email: String,
    val department: String,
    val team: String?,
    val jobTitle: String,
    val employmentType: String,
    val totalAllocationPercent: Long
)
