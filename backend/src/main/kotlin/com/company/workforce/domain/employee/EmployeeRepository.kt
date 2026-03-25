package com.company.workforce.domain.employee

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

interface EmployeeRepository : JpaRepository<Employee, UUID> {

    fun findByEmail(email: String): Employee?

    @Query("""
        SELECT DISTINCT e FROM Employee e
        LEFT JOIN EmployeeSkill es ON es.employeeId = e.id
        WHERE e.isActive = true
        AND (:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        AND (:department IS NULL OR e.department = CAST(:department AS string))
        AND (:#{#employmentType} IS NULL OR e.employmentType = :#{#employmentType})
        AND (:#{#skillIds} IS NULL OR es.skillId IN :#{#skillIds})
        AND (
            :maxAllocationPercent IS NULL OR
            (SELECT COALESCE(SUM(pa.allocationPercent), 0)
             FROM ProjectAssignment pa
             WHERE pa.employeeId = e.id
               AND pa.isActive = true
               AND pa.startDate <= CURRENT_DATE
               AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
            ) <= :maxAllocationPercent
        )
    """)
    fun search(
        search: String?,
        department: String?,
        @Param("employmentType") employmentType: EmploymentType?,
        @Param("skillIds") skillIds: List<UUID>?,
        maxAllocationPercent: Int?,
        pageable: Pageable
    ): Page<Employee>

    @Query("""
        SELECT e FROM Employee e WHERE e.isActive = true
        AND (100 - (
            SELECT COALESCE(SUM(pa.allocationPercent), 0)
            FROM ProjectAssignment pa
            WHERE pa.employeeId = e.id AND pa.isActive = true
              AND pa.startDate <= CURRENT_DATE
              AND (pa.endDate IS NULL OR pa.endDate >= CURRENT_DATE)
        )) >= :minAvailable
        AND NOT EXISTS (
            SELECT pa FROM ProjectAssignment pa
            WHERE pa.employeeId = e.id AND pa.isActive = true
              AND pa.allocationPercent = 100
              AND pa.startDate <= :fromDate
              AND (pa.endDate IS NULL OR pa.endDate >= :toDate)
        )
    """)
    fun findAvailable(
        minAvailable: Int,
        fromDate: LocalDate,
        toDate: LocalDate,
        pageable: Pageable
    ): Page<Employee>

    @Query("""
        SELECT e FROM Employee e
        WHERE e.isActive = true
          AND e.hiredAt <= :hiredBefore
          AND (e.skillsLastUpdatedAt IS NULL OR e.skillsLastUpdatedAt < :staleThreshold)
    """)
    fun findStaleSkillEmployees(
        @Param("hiredBefore") hiredBefore: LocalDate,
        @Param("staleThreshold") staleThreshold: LocalDateTime
    ): List<Employee>
}
