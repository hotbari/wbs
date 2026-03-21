package com.company.workforce.api.skill.dto

import com.company.workforce.domain.skill.Proficiency
import java.util.UUID

data class EmployeeSkillRequest(
    val skillId: UUID,
    val proficiency: Proficiency,
    val certified: Boolean? = null,
    val note: String? = null
)
