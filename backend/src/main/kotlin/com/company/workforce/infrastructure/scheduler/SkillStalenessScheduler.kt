package com.company.workforce.infrastructure.scheduler

import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.infrastructure.email.EmailService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.LocalDateTime

@Component
class SkillStalenessScheduler(
    private val employeeRepository: EmployeeRepository,
    private val emailService: EmailService,
    @Value("\${skill-staleness.threshold-days:90}") private val thresholdDays: Long,
    @Value("\${skill-staleness.from-email:noreply@workforce.internal}") private val fromEmail: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // Every Monday at 09:00
    @Scheduled(cron = "0 0 9 * * MON")
    fun sendStalenessNudges() {
        val staleThreshold = LocalDateTime.now().minusDays(thresholdDays)
        val hiredBefore = LocalDate.now().minusDays(thresholdDays)
        val staleEmployees = employeeRepository.findStaleSkillEmployees(hiredBefore, staleThreshold)
        log.info("Skill staleness check: {} employees to nudge", staleEmployees.size)
        staleEmployees.forEach { emp ->
            emailService.sendSkillUpdateNudge(emp.email, emp.fullName, fromEmail)
        }
    }
}
