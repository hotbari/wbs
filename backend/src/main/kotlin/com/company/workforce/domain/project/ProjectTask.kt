package com.company.workforce.domain.project

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "project_tasks")
class ProjectTask(
    @Id val id: UUID = UUID.randomUUID(),
    val phaseId: UUID,
    var title: String,
    var description: String? = null,
    var assigneeId: UUID? = null,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    var status: TaskStatus = TaskStatus.TODO,
    var progressPercent: Int = 0,
    var dueDate: LocalDate? = null,
    val createdAt: Instant = Instant.now()
)
