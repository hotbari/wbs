package com.company.workforce.api.skill.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateSkillRequest(
    @field:NotBlank @field:Size(max = 100) val name: String,
    @field:NotBlank @field:Size(max = 100) val category: String,
    val description: String? = null
)
