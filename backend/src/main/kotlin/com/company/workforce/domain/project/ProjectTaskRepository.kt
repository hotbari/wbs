package com.company.workforce.domain.project

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate
import java.util.UUID

interface ProjectTaskRepository : JpaRepository<ProjectTask, UUID> {
    fun findByPhaseIdOrderByCreatedAtAsc(phaseId: UUID): List<ProjectTask>
    fun findByAssigneeIdAndStatusNotOrderByDueDateAsc(assigneeId: UUID, status: TaskStatus): List<ProjectTask>
    fun findByAssigneeIdOrderByCreatedAtAsc(assigneeId: UUID): List<ProjectTask>
    fun countByPhaseIdIn(phaseIds: List<UUID>): Long
    fun countByPhaseIdInAndStatus(phaseIds: List<UUID>, status: TaskStatus): Long
    fun countByPhaseIdInAndDueDateBeforeAndStatusNot(phaseIds: List<UUID>, date: LocalDate, status: TaskStatus): Long
}
