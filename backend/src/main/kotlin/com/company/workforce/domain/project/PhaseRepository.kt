package com.company.workforce.domain.project

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PhaseRepository : JpaRepository<Phase, UUID> {
    fun findByProjectIdOrderByOrderIndex(projectId: UUID): List<Phase>
    fun existsByProjectIdAndOrderIndex(projectId: UUID, orderIndex: Int): Boolean
    fun existsByProjectIdAndOrderIndexAndIdNot(projectId: UUID, orderIndex: Int, id: UUID): Boolean
    fun countByProjectId(projectId: UUID): Long
}
