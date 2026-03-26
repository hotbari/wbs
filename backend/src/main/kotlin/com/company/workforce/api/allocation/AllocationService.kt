package com.company.workforce.api.allocation

import com.company.workforce.api.allocation.dto.AllocationResponse
import com.company.workforce.api.allocation.dto.CreateAllocationRequest
import com.company.workforce.api.allocation.dto.UpdateAllocationRequest
import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.common.PageResponse
import com.company.workforce.domain.allocation.ProjectAssignment
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.ProjectRepository
import com.company.workforce.infrastructure.email.EmailService
import org.slf4j.LoggerFactory
import org.springframework.dao.CannotSerializeTransactionException
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AllocationService(
    private val assignmentRepository: ProjectAssignmentRepository,
    private val employeeRepository: EmployeeRepository,
    private val projectRepository: ProjectRepository,
    private val emailService: EmailService
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(isolation = Isolation.SERIALIZABLE)
    fun create(request: CreateAllocationRequest): AllocationResponse {
        try {
            if (!employeeRepository.existsById(request.employeeId))
                throw NotFoundException("Employee not found")
            request.projectId?.let { pid ->
                if (!projectRepository.existsById(pid)) throw NotFoundException("Project not found")
            }

            // Acquire pessimistic write lock on all active assignments to prevent concurrent over-allocation
            assignmentRepository.findActiveForUpdateLock(request.employeeId)

            val currentTotal = assignmentRepository.sumCurrentAllocation(request.employeeId)
            if (currentTotal + request.allocationPercent > 100)
                throw ConflictException(
                    "Would exceed 100% allocation (current: $currentTotal%, requested: ${request.allocationPercent}%)"
                )

            val saved = assignmentRepository.save(
                ProjectAssignment(
                    employeeId = request.employeeId,
                    projectName = request.projectName,
                    projectId = request.projectId,
                    roleInProject = request.roleInProject,
                    allocationPercent = request.allocationPercent,
                    startDate = request.startDate,
                    endDate = request.endDate
                )
            )

            // Fire assignment confirmation email — failure must not roll back the allocation
            try {
                val employee = employeeRepository.findById(request.employeeId).orElse(null)
                employee?.let {
                    emailService.sendAssignmentConfirmation(
                        toEmail = it.email,
                        fullName = it.fullName,
                        projectName = request.projectName,
                        roleInProject = request.roleInProject,
                        allocationPercent = request.allocationPercent,
                        startDate = request.startDate
                    )
                }
            } catch (e: Exception) {
                log.warn("Failed to send assignment confirmation email: {}", e.message)
            }

            return saved.toResponse()
        } catch (e: CannotSerializeTransactionException) {
            throw ConflictException("Concurrent allocation conflict — please retry")
        }
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    fun update(id: UUID, request: UpdateAllocationRequest): AllocationResponse {
        try {
            val assignment = assignmentRepository.findById(id)
                .orElseThrow { NotFoundException("Allocation not found") }

            request.allocationPercent?.let { newPct ->
                assignmentRepository.findActiveForUpdateLock(assignment.employeeId)
                val currentTotal = assignmentRepository.sumTodayAllocation(assignment.employeeId, id)
                if (currentTotal + newPct > 100)
                    throw ConflictException("Would exceed 100% allocation")
                assignment.allocationPercent = newPct
            }
            request.projectName?.let { assignment.projectName = it }
            request.roleInProject?.let { assignment.roleInProject = it }
            request.startDate?.let { assignment.startDate = it }
            request.endDate?.let { assignment.endDate = it }
            request.isActive?.let { assignment.isActive = it }

            return assignmentRepository.save(assignment).toResponse()
        } catch (e: CannotSerializeTransactionException) {
            throw ConflictException("Concurrent allocation conflict — please retry")
        }
    }

    @Transactional
    fun softDelete(id: UUID) {
        val assignment = assignmentRepository.findById(id)
            .orElseThrow { NotFoundException("Allocation not found") }
        assignment.isActive = false
        assignmentRepository.save(assignment)
    }

    @Transactional(readOnly = true)
    fun listAll(employeeId: UUID?, projectName: String?, isActive: Boolean?, pageable: Pageable): PageResponse<AllocationResponse> {
        val page = assignmentRepository.findWithFilters(employeeId, projectName, isActive, pageable)
        return PageResponse(
            data = page.content.map { it.toResponse() },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    @Transactional(readOnly = true)
    fun listForEmployee(employeeId: UUID): List<AllocationResponse> =
        assignmentRepository.findByEmployeeId(employeeId).map { it.toResponse() }

    private fun ProjectAssignment.toResponse() = AllocationResponse(
        id = id,
        employeeId = employeeId,
        projectName = projectName,
        projectId = projectId,
        roleInProject = roleInProject,
        allocationPercent = allocationPercent,
        startDate = startDate,
        endDate = endDate,
        isActive = isActive
    )
}
