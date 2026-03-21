package com.company.workforce.domain.user

import jakarta.persistence.*
import org.hibernate.annotations.JdbcType
import org.hibernate.dialect.PostgreSQLEnumJdbcType
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id val id: UUID = UUID.randomUUID(),
    var email: String,
    var passwordHash: String,
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType::class)
    var role: UserRole,
    var employeeId: UUID,
    var isActive: Boolean = true,
    val createdAt: Instant = Instant.now()
)
