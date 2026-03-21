package com.company.workforce.domain.project

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "projects")
class Project(
    @Id val id: UUID = UUID.randomUUID(),
    var name: String,
    var description: String? = null,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    var status: ProjectStatus = ProjectStatus.ACTIVE,
    var startDate: LocalDate,
    var endDate: LocalDate? = null,
    val createdBy: UUID,
    val createdAt: Instant = Instant.now()
)
