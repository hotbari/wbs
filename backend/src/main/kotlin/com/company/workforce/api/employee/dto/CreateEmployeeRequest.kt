package com.company.workforce.api.employee.dto

import com.company.workforce.domain.employee.EmploymentType
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class CreateEmployeeRequest(
    @field:NotBlank @field:Size(max = 255) val fullName: String,
    @field:NotBlank @field:Email @field:Size(max = 255) val email: String,
    @field:NotBlank @field:Size(min = 8) val password: String,
    @field:Pattern(regexp = "[0-9 +\\-()]{7,20}") val phone: String? = null,
    @field:NotBlank @field:Size(max = 100) val department: String,
    val team: String? = null,
    @field:NotBlank @field:Size(max = 100) val jobTitle: String,
    val grade: String? = null,
    val employmentType: EmploymentType,
    val hiredAt: LocalDate
)
