package com.company.workforce.domain.project

import jakarta.persistence.*
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(
    name = "phases",
    uniqueConstraints = [UniqueConstraint(columnNames = ["project_id", "order_index"])]
)
class Phase(
    @Id val id: UUID = UUID.randomUUID(),
    val projectId: UUID,
    var name: String,
    var startDate: LocalDate,
    var endDate: LocalDate,
    var orderIndex: Int
)
