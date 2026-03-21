package com.company.workforce.api.auth.dto

import java.util.UUID

data class LoginResponse(val accessToken: String, val user: UserDto)
data class UserDto(val id: UUID, val email: String, val role: String, val employeeId: UUID)
