package com.company.workforce.api.employee

import com.company.workforce.api.allocation.AllocationService
import com.company.workforce.api.allocation.dto.AllocationResponse
import com.company.workforce.api.project.SidebarService
import com.company.workforce.api.project.dto.MyTaskResponse
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.UnauthorizedException
import com.company.workforce.api.employee.dto.CreateEmployeeRequest
import com.company.workforce.api.employee.dto.UpdateEmployeeRequest
import com.company.workforce.domain.employee.EmploymentType
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/employees")
class EmployeeController(
    private val employeeService: EmployeeService,
    private val userRepository: UserRepository,
    private val allocationService: AllocationService,
    private val sidebarService: SidebarService
) {

    @GetMapping
    fun list(
        @RequestParam search: String?,
        @RequestParam department: String?,
        @RequestParam employmentType: EmploymentType?,
        @RequestParam(required = false) skillIds: List<UUID>?,
        @RequestParam(required = false) maxAllocationPercent: Int?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = employeeService.list(search, department, employmentType, skillIds, maxAllocationPercent, PageRequest.of(page - 1, pageSize))

    @GetMapping("/available")
    fun available(
        @RequestParam minAvailablePercent: Int,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) fromDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) toDate: LocalDate,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = employeeService.listAvailable(minAvailablePercent, fromDate, toDate, PageRequest.of(page - 1, pageSize))

    @GetMapping("/{id}")
    fun getOne(@PathVariable id: UUID) = employeeService.getDetail(id)

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateEmployeeRequest) = employeeService.create(request)

    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    fun update(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateEmployeeRequest,
        @AuthenticationPrincipal userDetails: UserDetails
    ): com.company.workforce.api.employee.dto.EmployeeDetail {
        val caller = userRepository.findByEmail(userDetails.username)
            ?: throw UnauthorizedException("User not found")
        return employeeService.update(id, request, caller)
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deactivate(@PathVariable id: UUID) = employeeService.deactivate(id)

    @GetMapping("/{id}/tasks")
    fun listTasks(@PathVariable id: UUID): List<MyTaskResponse> =
        sidebarService.getEmployeeTasks(id)

    @GetMapping("/{id}/allocations")
    @PreAuthorize("isAuthenticated()")
    fun listAllocations(
        @PathVariable id: UUID,
        @AuthenticationPrincipal ud: UserDetails
    ): List<AllocationResponse> {
        val caller = userRepository.findByEmail(ud.username)
            ?: throw UnauthorizedException("User not found")
        if (caller.role != UserRole.ADMIN && caller.employeeId != id)
            throw ForbiddenException("Cannot view another employee's allocations")
        return allocationService.listForEmployee(id)
    }
}
