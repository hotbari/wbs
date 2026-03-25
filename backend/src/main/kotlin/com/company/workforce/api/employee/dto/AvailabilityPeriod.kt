package com.company.workforce.api.employee.dto

import java.time.LocalDate

data class AvailabilityPeriod(
    val from: LocalDate,
    val to: LocalDate?,         // null = open-ended
    val availablePercent: Int
)
