package com.company.workforce.infrastructure.email

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.MailException
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    @Value("\${app.base-url:http://localhost:3000}") private val baseUrl: String
) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun sendSkillUpdateNudge(toEmail: String, fullName: String, fromEmail: String) {
        val msg = SimpleMailMessage().apply {
            setTo(toEmail)
            setFrom(fromEmail)
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
}
