package com.company.workforce.api.skill.dto

import com.company.workforce.domain.skill.Skill
import java.util.UUID

data class SkillResponse(
    val id: UUID,
    val name: String,
    val category: String,
    val description: String?
) {
    companion object {
        fun from(skill: Skill) = SkillResponse(
            id = skill.id,
            name = skill.name,
            category = skill.category,
            description = skill.description
        )
    }
}
