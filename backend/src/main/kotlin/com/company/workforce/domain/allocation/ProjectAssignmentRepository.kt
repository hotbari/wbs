package com.company.workforce.domain.allocation

import jakarta.persistence.LockModeType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

interface ProjectAssignmentRepository : JpaRepository<ProjectAssignment, UUID> {

    fun findByEmployeeId(employeeId: UUID): List<ProjectAssignment>

    @Query("""
        SELECT pa FROM ProjectAssignment pa WHERE
        (:employeeId IS NULL OR pa.employeeId = :employeeId)
        AND (:projectName IS NULL OR LOWER(pa.projectName) LIKE LOWER(CONCAT('%', :projectName, '%')))
        AND (CAST(:isActive AS string) IS NULL OR pa.isActive = :isActive)
    """)
    fun findWithFilters(
        @Param("employeeId") employeeId: UUID?,
        @Param("projectName") projectName: String?,
        @Param("isActive") isActive: Boolean?,
        pageable: Pageable
    ): Page<ProjectAssignment>

    @Query("""
        SELECT COALESCE(SUM(pa.allocationPercent), 0)
        FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId
          AND pa.isActive = true
          AND pa.id <> :excludeId
          AND pa.startDate <= CURRENT_DATE
          AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
    """)
    fun sumTodayAllocation(employeeId: UUID, excludeId: UUID): Long

    @Query("""
        SELECT COALESCE(SUM(pa.allocationPercent), 0)
        FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId
          AND pa.isActive = true
          AND pa.startDate <= CURRENT_DATE
          AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
    """)
    fun sumCurrentAllocation(employeeId: UUID): Long

    @Transactional
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT pa FROM ProjectAssignment pa
        WHERE pa.employeeId = :employeeId AND pa.isActive = true
    """)
    fun findActiveForUpdateLock(employeeId: UUID): List<ProjectAssignment>
}
