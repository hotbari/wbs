package com.company.workforce.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties(prefix = "jwt")
@Component
class JwtConfig {
    var secret: String = ""
    var accessTokenExpiryMs: Long = 900_000L
    var refreshTokenExpiryDays: Long = 7L
}
