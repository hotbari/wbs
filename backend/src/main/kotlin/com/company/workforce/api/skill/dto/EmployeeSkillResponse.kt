package com.company.workforce.api.skill.dto

import java.time.LocalDateTime
import java.util.UUID

data class EmployeeSkillResponse(
    val id: UUID,
    val skillId: UUID,
    val proficiency: String,
    val certified: Boolean,
    val note: String?,
    val updatedAt: LocalDateTime
)
