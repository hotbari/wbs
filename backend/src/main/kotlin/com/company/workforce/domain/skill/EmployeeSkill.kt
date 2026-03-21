package com.company.workforce.domain.skill

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "employee_skills")
class EmployeeSkill(
    @Id val id: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    val skillId: UUID,
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "proficiency_level")
    var proficiency: Proficiency,
    var certified: Boolean = false,
    var note: String? = null
)
