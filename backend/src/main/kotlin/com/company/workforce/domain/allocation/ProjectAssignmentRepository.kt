package com.company.workforce.domain.allocation

import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface ProjectAssignmentRepository : JpaRepository<ProjectAssignment, UUID> {

    fun findByEmployeeId(employeeId: UUID): List<ProjectAssignment>

    @Query("""
        SELECT COALESCE(SUM(pa.allocationPercent), 0)
        FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId
          AND pa.isActive = true
          AND pa.id <> :excludeId
          AND pa.startDate <= CURRENT_DATE
          AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
    """)
    fun sumTodayAllocation(employeeId: UUID, excludeId: UUID): Int

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT pa FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId AND pa.isActive = true
    """)
    fun findActiveForUpdateLock(employeeId: UUID): List<ProjectAssignment>
}
