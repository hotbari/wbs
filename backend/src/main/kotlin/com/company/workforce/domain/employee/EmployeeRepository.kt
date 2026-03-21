package com.company.workforce.domain.employee

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface EmployeeRepository : JpaRepository<Employee, UUID> {

    @Query("""
        SELECT e FROM Employee e WHERE e.isActive = true
        AND (:search IS NULL OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:department IS NULL OR e.department = :department)
        AND (:employmentType IS NULL OR e.employmentType = :employmentType)
    """)
    fun search(
        search: String?,
        department: String?,
        employmentType: EmploymentType?,
        pageable: Pageable
    ): Page<Employee>
}
