package com.company.workforce.api.project.dto

import java.time.LocalDate

data class UpdatePhaseRequest(
    val name: String? = null,
    val startDate: LocalDate? = null,
    val endDate: LocalDate? = null,
    val orderIndex: Int? = null
)
