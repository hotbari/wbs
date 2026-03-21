package com.company.workforce.api.admin

import com.company.workforce.api.employee.dto.EmployeeSummary
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.Employee
import com.company.workforce.domain.employee.EmployeeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class AdminService(
    private val employeeRepository: EmployeeRepository,
    private val assignmentRepository: ProjectAssignmentRepository
) {
    fun getDashboard(): DashboardResponse {
        val activeEmployees = employeeRepository.findAll().filter { it.isActive }
        val totalActive = activeEmployees.size

        // Get current allocation for each active employee
        val allocations = activeEmployees.map { emp ->
            assignmentRepository.sumCurrentAllocation(emp.id)
        }
        val avg = if (allocations.isEmpty()) 0.0 else allocations.average()

        // Available employees: at least 50% available today and 30 days out
        val today = LocalDate.now()
        val thirtyDaysOut = today.plusDays(30)
        val available = employeeRepository.findAvailable(50, today, thirtyDaysOut, PageRequest.of(0, 10))
            .content.map { it.toSummary() }

        // Top 5 most allocated employees
        val topOverAllocated = activeEmployees.zip(allocations)
            .sortedByDescending { it.second }
            .take(5)
            .map { (emp, pct) -> mapOf<String, Any>("employee" to emp.toSummary(), "allocationPercent" to pct) }

        return DashboardResponse(totalActive, avg, available, topOverAllocated)
    }

    private fun Employee.toSummary(): EmployeeSummary {
        val total = assignmentRepository.sumCurrentAllocation(id)
        return EmployeeSummary(
            id = id,
            fullName = fullName,
            email = email,
            department = department,
            team = team,
            jobTitle = jobTitle,
            employmentType = employmentType.name,
            totalAllocationPercent = total
        )
    }
}
