package com.company.workforce.domain.share

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "share_tokens")
class ShareToken(
    @Id val id: UUID = UUID.randomUUID(),
    val token: UUID = UUID.randomUUID(),
    val employeeId: UUID? = null,
    val expiresAt: LocalDateTime,
    val createdAt: LocalDateTime = LocalDateTime.now(java.time.ZoneOffset.UTC),
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    val scope: ShareTokenScope = ShareTokenScope.EMPLOYEE,
    val projectId: UUID? = null
)
