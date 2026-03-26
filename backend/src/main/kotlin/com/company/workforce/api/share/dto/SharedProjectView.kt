package com.company.workforce.api.share.dto

import java.time.LocalDateTime

data class SharedProjectView(
    val projectName: String,
    val allocations: List<StaffingSummary>,
    val generatedAt: LocalDateTime
) {
    data class StaffingSummary(
        val fullName: String,
        val roleInProject: String,
        val allocationPercent: Int
    )
}
