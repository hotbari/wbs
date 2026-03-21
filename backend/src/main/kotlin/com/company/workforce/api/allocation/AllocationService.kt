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
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Isolation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AllocationService(
    private val assignmentRepository: ProjectAssignmentRepository,
    private val employeeRepository: EmployeeRepository
) {
    @Transactional(isolation = Isolation.SERIALIZABLE)
    fun create(request: CreateAllocationRequest): AllocationResponse {
        if (!employeeRepository.existsById(request.employeeId))
            throw NotFoundException("Employee not found")

        // Acquire pessimistic write lock on all active assignments to prevent concurrent over-allocation
        assignmentRepository.findActiveForUpdateLock(request.employeeId)

        val currentTotal = assignmentRepository.sumCurrentAllocation(request.employeeId)
        if (currentTotal + request.allocationPercent > 100)
            throw ConflictException(
                "Would exceed 100% allocation (current: $currentTotal%, requested: ${request.allocationPercent}%)"
            )

        return assignmentRepository.save(
            ProjectAssignment(
                employeeId = request.employeeId,
                projectName = request.projectName,
                roleInProject = request.roleInProject,
                allocationPercent = request.allocationPercent,
                startDate = request.startDate,
                endDate = request.endDate
            )
        ).toResponse()
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    fun update(id: UUID, request: UpdateAllocationRequest): AllocationResponse {
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
        val all = assignmentRepository.findAll().filter { pa ->
            (employeeId == null || pa.employeeId == employeeId) &&
            (projectName == null || pa.projectName.contains(projectName, ignoreCase = true)) &&
            (isActive == null || pa.isActive == isActive)
        }
        val page = pageable.pageNumber
        val size = pageable.pageSize
        val paged = all.drop(page * size).take(size)
        return PageResponse(paged.map { it.toResponse() }, page + 1, size, all.size.toLong())
    }

    @Transactional(readOnly = true)
    fun listForEmployee(employeeId: UUID): List<AllocationResponse> =
        assignmentRepository.findByEmployeeId(employeeId).map { it.toResponse() }

    private fun ProjectAssignment.toResponse() = AllocationResponse(
        id = id,
        employeeId = employeeId,
        projectName = projectName,
        roleInProject = roleInProject,
        allocationPercent = allocationPercent,
        startDate = startDate,
        endDate = endDate,
        isActive = isActive
    )
}
