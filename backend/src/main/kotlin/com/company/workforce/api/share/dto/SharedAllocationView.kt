package com.company.workforce.api.share.dto

import java.time.LocalDateTime

data class SharedAllocationView(
    val fullName: String,
    val jobTitle: String,
    val department: String,
    val totalAllocationPercent: Long,
    val allocations: List<AllocationSummary>,
    val generatedAt: LocalDateTime
) {
    data class AllocationSummary(
        val projectName: String,
        val roleInProject: String,
        val allocationPercent: Int,
        val startDate: String,
        val endDate: String?
    )
}
