package com.company.workforce.api.share.dto

import java.time.LocalDateTime

data class ShareLinkResponse(
    val token: String,
    val url: String,
    val expiresAt: LocalDateTime
)
