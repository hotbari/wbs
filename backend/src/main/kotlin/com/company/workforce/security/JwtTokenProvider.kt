package com.company.workforce.security

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import java.util.UUID
import javax.crypto.SecretKey

@Component
class JwtTokenProvider(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.access-token-expiry-ms}") private val expiryMs: Long
) {
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(secret.toByteArray(Charsets.UTF_8))
    }

    fun generateToken(email: String, userId: UUID): String =
        Jwts.builder()
            .subject(email)
            .claim("userId", userId.toString())
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expiryMs))
            .signWith(key)
            .compact()

    fun extractEmail(token: String): String =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload.subject

    fun isValid(token: String): Boolean {
        // Validate JWT structure: header.payload.signature
        val parts = token.split(".")
        if (parts.size != 3) return false
        // HMAC-SHA256 produces exactly 32 bytes = 43 base64url chars (no padding)
        // Guard against lenient base64url decoders accepting extra trailing chars
        if (parts[2].length != 43) return false
        return runCatching { extractEmail(token) }.isSuccess
    }
}
