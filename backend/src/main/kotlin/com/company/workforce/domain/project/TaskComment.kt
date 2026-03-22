package com.company.workforce.domain.project

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "task_comments")
class TaskComment(
    @Id val id: UUID = UUID.randomUUID(),
    val taskId: UUID,
    val authorId: UUID,
    var body: String,
    val createdAt: Instant = Instant.now()
)
