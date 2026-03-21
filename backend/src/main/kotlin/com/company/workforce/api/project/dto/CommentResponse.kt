package com.company.workforce.api.project.dto

import java.time.Instant
import java.util.UUID

data class AuthorInfo(val id: UUID, val fullName: String)

data class CommentResponse(
    val id: UUID,
    val taskId: UUID,
    val author: AuthorInfo,
    val body: String,
    val createdAt: Instant
)
