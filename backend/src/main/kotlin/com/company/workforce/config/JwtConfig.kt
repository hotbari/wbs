package com.company.workforce.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties(prefix = "jwt")
@Component
data class JwtConfig(
    val secret: String = "",
    val accessTokenExpiryMs: Long = 900_000L,
    val refreshTokenExpiryDays: Long = 7L
)
