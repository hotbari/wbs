package com.company.workforce.infrastructure.email

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    @Value("\${app.base-url:http://localhost:3000}") private val baseUrl: String,
    @Value("\${app.mail.from:noreply@workforce.local}") private val fromEmail: String
) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun sendSkillUpdateNudge(toEmail: String, fullName: String, senderEmail: String) {
        val msg = SimpleMailMessage().apply {
            setTo(toEmail)
            setFrom(senderEmail)
            subject = "[인력관리] 스킬 정보 업데이트를 해주세요"
            text = """
안녕하세요 $fullName 님,

90일 이상 스킬 정보가 업데이트되지 않았습니다.
최신 스킬 정보는 프로젝트 배정에 직접 영향을 줍니다.

아래 링크에서 스킬을 업데이트해 주세요:
$baseUrl/me

감사합니다.
인력관리 시스템
            """.trimIndent()
        }
        try {
            mailSender.send(msg)
            log.info("Sent skill nudge email to {}", toEmail)
        } catch (e: MailException) {
            log.warn("Failed to send skill nudge email to {}: {}", toEmail, e.message)
        }
    }

    fun sendAssignmentConfirmation(
        toEmail: String,
        fullName: String,
        projectName: String,
        roleInProject: String,
        allocationPercent: Int,
        startDate: LocalDate
    ) {
        val msg = SimpleMailMessage().apply {
            setTo(toEmail)
            setFrom(fromEmail)
            subject = "[인력관리] 프로젝트 배정 안내"
            text = """
안녕하세요 $fullName 님,

프로젝트에 배정되셨습니다.

프로젝트: $projectName
역할: $roleInProject
할당률: $allocationPercent%
시작일: $startDate

자세한 내용은 아래 링크에서 확인하세요:
$baseUrl/me

감사합니다.
인력관리 시스템
            """.trimIndent()
        }
        try {
            mailSender.send(msg)
            log.info("Sent assignment confirmation email to {}", toEmail)
        } catch (e: MailException) {
            log.warn("Failed to send assignment confirmation email to {}: {}", toEmail, e.message)
        }
    }
}
