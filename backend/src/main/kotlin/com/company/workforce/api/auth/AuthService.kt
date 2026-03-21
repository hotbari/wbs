package com.company.workforce.api.auth

import com.company.workforce.api.auth.dto.LoginRequest
import com.company.workforce.api.auth.dto.LoginResponse
import com.company.workforce.api.auth.dto.UserDto
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.UnauthorizedException
import com.company.workforce.config.JwtConfig
import com.company.workforce.domain.auth.RefreshToken
import com.company.workforce.domain.auth.RefreshTokenRepository
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.security.JwtTokenProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val jwtConfig: JwtConfig
) {
    fun login(request: LoginRequest): Pair<LoginResponse, String> {
        val user = userRepository.findByEmail(request.email)
            ?: throw UnauthorizedException("Invalid credentials")
        if (!user.isActive) throw ForbiddenException("Account deactivated")
        if (!passwordEncoder.matches(request.password, user.passwordHash))
            throw UnauthorizedException("Invalid credentials")

        val accessToken = jwtTokenProvider.generateToken(user.email, user.id)
        val rawRefresh = UUID.randomUUID().toString()
        refreshTokenRepository.save(RefreshToken(
            userId = user.id,
            tokenHash = passwordEncoder.encode(rawRefresh),
            expiresAt = Instant.now().plus(jwtConfig.refreshTokenExpiryDays, ChronoUnit.DAYS)
        ))

        return LoginResponse(accessToken, UserDto(user.id, user.email, user.role.name, user.employeeId)) to rawRefresh
    }

    fun refresh(rawToken: String): String {
        val allActive = refreshTokenRepository.findAll()
            .filter { !it.revoked && it.expiresAt.isAfter(Instant.now()) }

        val matched = allActive.firstOrNull { passwordEncoder.matches(rawToken, it.tokenHash) }
            ?: throw UnauthorizedException("Invalid or expired refresh token")

        matched.revoked = true
        refreshTokenRepository.save(matched)

        val user = userRepository.findById(matched.userId).orElseThrow()
        val newRawRefresh = UUID.randomUUID().toString()
        refreshTokenRepository.save(RefreshToken(
            userId = user.id,
            tokenHash = passwordEncoder.encode(newRawRefresh),
            expiresAt = Instant.now().plus(jwtConfig.refreshTokenExpiryDays, ChronoUnit.DAYS)
        ))
        return jwtTokenProvider.generateToken(user.email, user.id)
    }

    fun logout(userId: UUID) {
        refreshTokenRepository.revokeAllByUserId(userId)
    }
}
