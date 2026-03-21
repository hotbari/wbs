package com.company.workforce.api.employee

import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.common.PageResponse
import com.company.workforce.api.employee.dto.CreateEmployeeRequest
import com.company.workforce.api.employee.dto.EmployeeDetail
import com.company.workforce.api.employee.dto.EmployeeSummary
import com.company.workforce.api.employee.dto.UpdateEmployeeRequest
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.Employee
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.employee.EmploymentType
import com.company.workforce.domain.user.User
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import org.springframework.data.domain.Pageable
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class EmployeeService(
    private val employeeRepository: EmployeeRepository,
    private val userRepository: UserRepository,
    private val assignmentRepository: ProjectAssignmentRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @Transactional(readOnly = true)
    fun list(
        search: String?,
        department: String?,
        employmentType: EmploymentType?,
        pageable: Pageable
    ): PageResponse<EmployeeSummary> {
        val page = employeeRepository.search(search, department, employmentType, pageable)
        return PageResponse(
            data = page.content.map { it.toSummary() },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    @Transactional(readOnly = true)
    fun getDetail(id: UUID): EmployeeDetail =
        employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
            .toDetail()

    fun create(request: CreateEmployeeRequest): EmployeeDetail {
        if (employeeRepository.findByEmail(request.email) != null || userRepository.findByEmail(request.email) != null)
            throw ConflictException("Email already in use")
        val employee = employeeRepository.save(
            Employee(
                fullName = request.fullName,
                email = request.email,
                phone = request.phone,
                department = request.department,
                team = request.team,
                jobTitle = request.jobTitle,
                grade = request.grade,
                employmentType = request.employmentType,
                hiredAt = request.hiredAt
            )
        )
        userRepository.save(
            User(
                email = request.email,
                passwordHash = passwordEncoder.encode(request.password),
                role = UserRole.EMPLOYEE,
                employeeId = employee.id
            )
        )
        return employee.toDetail()
    }

    fun update(id: UUID, request: UpdateEmployeeRequest, callerUser: User): EmployeeDetail {
        val employee = employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
        if (callerUser.role != UserRole.ADMIN && callerUser.employeeId != id)
            throw ForbiddenException("Cannot edit another employee")
        if (callerUser.role == UserRole.ADMIN) {
            request.fullName?.let { employee.fullName = it }
            request.email?.let { newEmail ->
                if (newEmail != employee.email) {
                    if (employeeRepository.findByEmail(newEmail) != null || userRepository.findByEmail(newEmail) != null)
                        throw ConflictException("Email already in use")
                    employee.email = newEmail
                    userRepository.findByEmployeeId(id)?.let { user ->
                        user.email = newEmail
                        userRepository.save(user)
                    }
                }
            }
            request.department?.let { employee.department = it }
            request.jobTitle?.let { employee.jobTitle = it }
            request.employmentType?.let { employee.employmentType = it }
            request.hiredAt?.let { employee.hiredAt = it }
        }
        request.phone?.let { employee.phone = it }
        request.team?.let { employee.team = it }
        request.grade?.let { employee.grade = it }
        return employeeRepository.save(employee).toDetail()
    }

    fun deactivate(id: UUID) {
        val employee = employeeRepository.findById(id)
            .orElseThrow { NotFoundException("Employee not found") }
        employee.isActive = false
        employeeRepository.save(employee)
        userRepository.findByEmployeeId(id)?.let {
            it.isActive = false
            userRepository.save(it)
        }
        assignmentRepository.findByEmployeeId(id)
            .filter { it.isActive }
            .forEach { it.isActive = false; assignmentRepository.save(it) }
    }

    @Transactional(readOnly = true)
    fun listAvailable(
        minAvailablePercent: Int,
        fromDate: LocalDate,
        toDate: LocalDate,
        pageable: Pageable
    ): PageResponse<EmployeeSummary> {
        val page = employeeRepository.findAvailable(minAvailablePercent, fromDate, toDate, pageable)
        return PageResponse(
            data = page.content.map { it.toSummary() },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    private fun Employee.toSummary(): EmployeeSummary {
        val total = assignmentRepository.sumCurrentAllocation(id)
        return EmployeeSummary(id, fullName, email, department, team, jobTitle, employmentType.name, total)
    }

    private fun Employee.toDetail() = EmployeeDetail(
        id, fullName, email, phone, department, team, jobTitle, grade,
        employmentType.name, hiredAt, isActive, emptyList(), emptyList()
    )
}
