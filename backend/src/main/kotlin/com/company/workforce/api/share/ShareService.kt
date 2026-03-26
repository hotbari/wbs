package com.company.workforce.api.share

import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.share.dto.ShareLinkResponse
import com.company.workforce.api.share.dto.SharedAllocationView
import com.company.workforce.api.share.dto.SharedProjectView
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.project.ProjectRepository
import com.company.workforce.domain.share.ShareToken
import com.company.workforce.domain.share.ShareTokenRepository
import com.company.workforce.domain.share.ShareTokenScope
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
class ShareService(
    private val shareTokenRepository: ShareTokenRepository,
    private val employeeRepository: EmployeeRepository,
    private val assignmentRepository: ProjectAssignmentRepository,
    private val projectRepository: ProjectRepository,
    @Value("\${app.base-url:http://localhost:3000}") private val baseUrl: String
) {
    fun createShareLink(employeeId: UUID): ShareLinkResponse {
        employeeRepository.findById(employeeId)
            .orElseThrow { NotFoundException("Employee not found") }
        val shareToken = shareTokenRepository.save(
            ShareToken(
                employeeId = employeeId,
                expiresAt = LocalDateTime.now(java.time.ZoneOffset.UTC).plusDays(30)
            )
        )
        return ShareLinkResponse(
            token = shareToken.token.toString(),
            url = "$baseUrl/share/${shareToken.token}",
            expiresAt = shareToken.expiresAt
        )
    }

    fun createProjectShareLink(projectId: UUID): ShareLinkResponse {
        projectRepository.findById(projectId)
            .orElseThrow { NotFoundException("Project not found") }
        val shareToken = shareTokenRepository.save(
            ShareToken(
                scope = ShareTokenScope.PROJECT,
                projectId = projectId,
                expiresAt = LocalDateTime.now(java.time.ZoneOffset.UTC).plusDays(30)
            )
        )
        return ShareLinkResponse(
            token = shareToken.token.toString(),
            url = "$baseUrl/share/${shareToken.token}",
            expiresAt = shareToken.expiresAt
        )
    }

    @Transactional(readOnly = true)
    fun resolveToken(token: UUID): Any {
        val shareToken = shareTokenRepository.findByToken(token)
            ?: throw NotFoundException("Share link not found or expired")
        if (shareToken.expiresAt.isBefore(LocalDateTime.now(java.time.ZoneOffset.UTC)))
            throw NotFoundException("Share link expired")

        return when (shareToken.scope) {
            ShareTokenScope.EMPLOYEE -> resolveEmployeeToken(shareToken)
            ShareTokenScope.PROJECT -> resolveProjectToken(shareToken)
        }
    }

    private fun resolveEmployeeToken(shareToken: ShareToken): SharedAllocationView {
        val employee = employeeRepository.findById(shareToken.employeeId!!)
            .orElseThrow { NotFoundException("Employee not found") }
        val today = LocalDate.now()
        val currentTotal = assignmentRepository.sumCurrentAllocation(shareToken.employeeId)
        val assignments = assignmentRepository.findByEmployeeId(shareToken.employeeId)
            .filter { it.isActive && it.startDate <= today && (it.endDate == null || it.endDate!! >= today) }

        return SharedAllocationView(
            fullName = employee.fullName,
            jobTitle = employee.jobTitle,
            department = employee.department,
            totalAllocationPercent = currentTotal,
            allocations = assignments.map { a ->
                SharedAllocationView.AllocationSummary(
                    projectName = a.projectName,
                    roleInProject = a.roleInProject,
                    allocationPercent = a.allocationPercent,
                    startDate = a.startDate.toString(),
                    endDate = a.endDate?.toString()
                )
            },
            generatedAt = LocalDateTime.now()
        )
    }

    private fun resolveProjectToken(shareToken: ShareToken): SharedProjectView {
        val project = projectRepository.findById(shareToken.projectId!!)
            .orElseThrow { NotFoundException("Project not found") }
        val assignments = assignmentRepository.findByProjectIdAndIsActive(shareToken.projectId, true)
        val employeeIds = assignments.map { it.employeeId }.toSet()
        val employeeMap = employeeRepository.findAllById(employeeIds).associateBy { it.id }

        return SharedProjectView(
            projectName = project.name,
            allocations = assignments.mapNotNull { a ->
                val emp = employeeMap[a.employeeId] ?: return@mapNotNull null
                SharedProjectView.StaffingSummary(
                    fullName = emp.fullName,
                    roleInProject = a.roleInProject,
                    allocationPercent = a.allocationPercent
                )
            },
            generatedAt = LocalDateTime.now()
        )
    }
}
