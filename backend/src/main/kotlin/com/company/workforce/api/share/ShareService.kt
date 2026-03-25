package com.company.workforce.api.share

import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.share.dto.ShareLinkResponse
import com.company.workforce.api.share.dto.SharedAllocationView
import com.company.workforce.domain.allocation.ProjectAssignmentRepository
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.share.ShareToken
import com.company.workforce.domain.share.ShareTokenRepository
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

    @Transactional(readOnly = true)
    fun resolveToken(token: UUID): SharedAllocationView {
        val shareToken = shareTokenRepository.findByToken(token)
            ?: throw NotFoundException("Share link not found or expired")
        if (shareToken.expiresAt.isBefore(LocalDateTime.now(java.time.ZoneOffset.UTC)))
            throw NotFoundException("Share link expired")

        val employee = employeeRepository.findById(shareToken.employeeId)
            .orElseThrow { NotFoundException("Employee not found") }
        val today = LocalDate.now()
        val currentTotal = assignmentRepository.sumCurrentAllocation(shareToken.employeeId)
        // Date-bound the list to match sumCurrentAllocation (startDate <= today AND endDate >= today or null)
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
}
