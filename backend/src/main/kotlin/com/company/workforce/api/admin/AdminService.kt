package com.company.workforce.api.admin

import com.company.workforce.api.employee.dto.EmployeeSummary
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.Employee
import com.company.workforce.domain.employee.EmployeeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional(readOnly = true)
class AdminService(
    private val employeeRepository: EmployeeRepository,
    private val assignmentRepository: ProjectAssignmentRepository
) {
    fun getDashboard(): DashboardResponse {
        val activeEmployees = employeeRepository.findAll().filter { it.isActive }
        val totalActive = activeEmployees.size

        // Build allocation map once — N queries but no re-fetching
        val allocationMap: Map<UUID, Long> = activeEmployees.associate { emp ->
            emp.id to assignmentRepository.sumCurrentAllocation(emp.id)
        }
        val avg = if (allocationMap.isEmpty()) 0.0 else allocationMap.values.average()

        val today = LocalDate.now()
        val thirtyDaysOut = today.plusDays(30)
        // Reuse allocation from map — no extra DB calls
        val available = employeeRepository.findAvailable(50, today, thirtyDaysOut, PageRequest.of(0, 10))
            .content.map { emp -> emp.toSummaryWithAlloc(allocationMap[emp.id] ?: 0L) }

        val topOverAllocated = activeEmployees
            .map { emp -> emp to (allocationMap[emp.id] ?: 0L) }
            .sortedByDescending { it.second }
            .take(5)
            .map { (emp, pct) -> mapOf("employee" to emp.toSummaryWithAlloc(pct), "allocationPercent" to pct) }

        return DashboardResponse(totalActive, avg, available, topOverAllocated)
    }

    private fun Employee.toSummaryWithAlloc(totalAlloc: Long) = EmployeeSummary(
        id = id,
        fullName = fullName,
        email = email,
        department = department,
        team = team,
        jobTitle = jobTitle,
        employmentType = employmentType.name,
        totalAllocationPercent = totalAlloc
    )
}
