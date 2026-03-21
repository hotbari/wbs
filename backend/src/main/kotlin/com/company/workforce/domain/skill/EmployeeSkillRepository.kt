package com.company.workforce.domain.skill

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EmployeeSkillRepository : JpaRepository<EmployeeSkill, UUID> {
    fun findByEmployeeId(employeeId: UUID): List<EmployeeSkill>
    fun findByEmployeeIdAndSkillId(employeeId: UUID, skillId: UUID): EmployeeSkill?
    fun existsByEmployeeIdAndSkillId(employeeId: UUID, skillId: UUID): Boolean
    fun existsBySkillId(skillId: UUID): Boolean
}
