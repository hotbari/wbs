package com.company.workforce.domain.skill

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.util.UUID

@Entity
@Table(name = "employee_skills")
class EmployeeSkill(
    @Id val id: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    val skillId: UUID,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    var proficiency: Proficiency,
    var certified: Boolean = false,
    var note: String? = null
)
