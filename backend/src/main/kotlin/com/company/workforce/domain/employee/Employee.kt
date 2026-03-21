package com.company.workforce.domain.employee

import jakarta.persistence.*
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "employees")
class Employee(
    @Id val id: UUID = UUID.randomUUID(),
    var fullName: String,
    var email: String,
    var phone: String? = null,
    var department: String,
    var team: String? = null,
    var jobTitle: String,
    var grade: String? = null,
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "employment_type")
    var employmentType: EmploymentType,
    var hiredAt: LocalDate,
    var isActive: Boolean = true
)
