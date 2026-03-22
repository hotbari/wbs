package com.company.workforce.security

import com.company.workforce.domain.user.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceImpl(private val userRepository: UserRepository) : UserDetailsService {
    override fun loadUserByUsername(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            ?: throw UsernameNotFoundException("User not found: $email")
        return UserDetailsImpl(
            userId = user.id,
            employeeId = user.employeeId,
            email = user.email,
            passwordHash = user.passwordHash,
            authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role.name}")),
            enabled = user.isActive
        )
    }
}
