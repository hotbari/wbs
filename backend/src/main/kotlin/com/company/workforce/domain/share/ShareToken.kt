package com.company.workforce.domain.share

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "share_tokens")
class ShareToken(
    @Id val id: UUID = UUID.randomUUID(),
    val token: UUID = UUID.randomUUID(),
    val employeeId: UUID,
    val expiresAt: LocalDateTime,
    val createdAt: LocalDateTime = LocalDateTime.now(java.time.ZoneOffset.UTC)
)
