package com.company.workforce

import com.company.workforce.domain.employee.Employee
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.employee.EmploymentType
import com.company.workforce.domain.user.User
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.LocalDate
import java.util.UUID

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = ["spring.jpa.hibernate.ddl-auto=none"]
)
@Testcontainers
abstract class IntegrationTestBase {
    companion object {
        @Container
        @JvmStatic
        val postgres = PostgreSQLContainer<Nothing>("postgres:16").apply {
            withDatabaseName("workforce_test")
            withUsername("test")
            withPassword("test")
        }

        @JvmStatic
        @DynamicPropertySource
        fun props(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
        }
    }

    protected fun createEmployee(
        employeeRepository: EmployeeRepository,
        email: String = "test@test.com",
        fullName: String = "Test User",
        role: UserRole = UserRole.EMPLOYEE
    ): Employee {
        return employeeRepository.save(Employee(
            fullName = fullName,
            email = email,
            department = "Engineering",
            jobTitle = "Engineer",
            employmentType = EmploymentType.FULL_TIME,
            hiredAt = LocalDate.of(2023, 1, 1)
        ))
    }

    protected fun createUser(
        userRepository: UserRepository,
        passwordEncoder: PasswordEncoder,
        employeeId: UUID,
        email: String = "test@test.com",
        password: String = "Password1",
        role: UserRole = UserRole.EMPLOYEE
    ): User {
        return userRepository.save(User(
            email = email,
            passwordHash = passwordEncoder.encode(password),
            role = role,
            employeeId = employeeId
        ))
    }
}
