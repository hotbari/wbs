package com.company.workforce.domain.auth

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "refresh_tokens")
class RefreshToken(
    @Id val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    var tokenHash: String,
    val expiresAt: Instant,
    var revoked: Boolean = false,
    val createdAt: Instant = Instant.now()
)
