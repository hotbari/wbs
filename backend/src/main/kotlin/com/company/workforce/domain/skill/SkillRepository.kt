package com.company.workforce.domain.skill

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SkillRepository : JpaRepository<Skill, UUID> {
    fun findByCategory(category: String): List<Skill>
    fun existsByName(name: String): Boolean
    fun existsByNameAndIdNot(name: String, id: UUID): Boolean
}
