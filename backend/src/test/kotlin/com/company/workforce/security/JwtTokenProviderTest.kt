package com.company.workforce.security

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.util.UUID

class JwtTokenProviderTest {
    private val secret = "test-secret-key-must-be-at-least-256-bits-long!!"
    private val provider = JwtTokenProvider(secret, expiryMs = 900_000L)

    @Test
    fun `generates token and extracts email`() {
        val token = provider.generateToken("alice@example.com", UUID.randomUUID())
        assertThat(provider.extractEmail(token)).isEqualTo("alice@example.com")
    }

    @Test
    fun `isValid returns false for tampered token`() {
        val token = provider.generateToken("alice@example.com", UUID.randomUUID())
        assertThat(provider.isValid(token + "x")).isFalse()
    }
}
