package com.company.workforce.api.auth

import com.company.workforce.api.auth.dto.LoginRequest
import com.company.workforce.api.auth.dto.LoginResponse
import com.company.workforce.domain.user.UserRepository
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val userRepository: UserRepository
) {
    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest, response: HttpServletResponse): LoginResponse {
        val (loginResponse, rawRefresh) = authService.login(request)
        response.addCookie(Cookie("refreshToken", rawRefresh).apply {
            isHttpOnly = true; secure = true; path = "/api/auth/refresh"; maxAge = 7 * 24 * 60 * 60
        })
        return loginResponse
    }

    @PostMapping("/refresh")
    fun refresh(@CookieValue("refreshToken") rawToken: String, response: HttpServletResponse): Map<String, String> {
        return mapOf("accessToken" to authService.refresh(rawToken))
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun logout(@AuthenticationPrincipal userDetails: UserDetails, response: HttpServletResponse) {
        val user = userRepository.findByEmail(userDetails.username)!!
        authService.logout(user.id)
        response.addCookie(Cookie("refreshToken", "").apply {
            maxAge = 0; isHttpOnly = true; path = "/api/auth/refresh"
        })
    }
}
