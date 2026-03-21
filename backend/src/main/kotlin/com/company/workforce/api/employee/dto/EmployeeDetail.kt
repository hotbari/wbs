package com.company.workforce.api.employee.dto

import java.time.LocalDate
import java.util.UUID

data class EmployeeDetail(
    val id: UUID,
    val fullName: String,
    val email: String,
    val phone: String?,
    val department: String,
    val team: String?,
    val jobTitle: String,
    val grade: String?,
    val employmentType: String,
    val hiredAt: LocalDate,
    val isActive: Boolean,
    val skills: List<Any>,
    val assignments: List<Any>
)
