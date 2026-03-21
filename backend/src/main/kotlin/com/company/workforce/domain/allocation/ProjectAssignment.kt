package com.company.workforce.domain.allocation

import jakarta.persistence.*
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "project_assignments")
class ProjectAssignment(
    @Id val id: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    var projectName: String,
    var roleInProject: String,
    var allocationPercent: Int,
    var startDate: LocalDate,
    var endDate: LocalDate? = null,
    var isActive: Boolean = true
)
