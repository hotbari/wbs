package com.company.workforce.domain.share

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime
import java.util.UUID

interface ShareTokenRepository : JpaRepository<ShareToken, UUID> {
    fun findByToken(token: UUID): ShareToken?
    fun deleteByExpiresAtBefore(threshold: LocalDateTime)
}
