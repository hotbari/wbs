package com.company.workforce.api.employee.dto

import com.company.workforce.domain.employee.EmploymentType
import java.time.LocalDate

data class UpdateEmployeeRequest(
    val fullName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val department: String? = null,
    val team: String? = null,
    val jobTitle: String? = null,
    val grade: String? = null,
    val employmentType: EmploymentType? = null,
    val hiredAt: LocalDate? = null
)
