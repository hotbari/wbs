package com.company.workforce.api.admin

import com.company.workforce.api.employee.dto.EmployeeSummary

data class DashboardResponse(
    val totalActiveEmployees: Int,
    val avgAllocationPercent: Double,
    val availableEmployees: List<EmployeeSummary>,
    val topOverAllocated: List<Map<String, Any>>
)
