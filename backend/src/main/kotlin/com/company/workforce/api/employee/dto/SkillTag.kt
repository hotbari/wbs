package com.company.workforce.api.employee.dto

import java.util.UUID

data class SkillTag(
    val skillId: UUID,
    val name: String,
    val proficiency: String
)
