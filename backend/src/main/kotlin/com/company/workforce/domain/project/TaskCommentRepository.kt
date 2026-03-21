package com.company.workforce.domain.project

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TaskCommentRepository : JpaRepository<TaskComment, UUID> {
    fun findByTaskIdOrderByCreatedAtAsc(taskId: UUID): List<TaskComment>
}
