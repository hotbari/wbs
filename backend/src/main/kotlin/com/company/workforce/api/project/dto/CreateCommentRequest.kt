package com.company.workforce.api.project.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateCommentRequest(
    @field:NotBlank @field:Size(max = 5000) val body: String
)
