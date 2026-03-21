package com.company.workforce.api.project

import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.common.UnauthorizedException
import com.company.workforce.api.project.dto.*
import com.company.workforce.domain.project.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TaskService(
    private val phaseRepository: PhaseRepository,
    private val taskRepository: ProjectTaskRepository,
    private val employeeRepository: com.company.workforce.domain.employee.EmployeeRepository
) {
    @Transactional
    fun create(phaseId: UUID, request: CreateTaskRequest): TaskResponse {
        if (!phaseRepository.existsById(phaseId)) throw NotFoundException("Phase not found")
        request.assigneeId?.let {
            if (!employeeRepository.existsById(it)) throw NotFoundException("Assignee not found")
        }
        return taskRepository.save(
            ProjectTask(phaseId = phaseId, title = request.title,
                description = request.description, assigneeId = request.assigneeId,
                dueDate = request.dueDate)
        ).toResponse()
    }

    @Transactional
    fun update(id: UUID, request: UpdateTaskRequest, callerEmployeeId: UUID, isAdmin: Boolean): TaskResponse {
        val task = taskRepository.findById(id).orElseThrow { NotFoundException("Task not found") }

        if (!isAdmin) {
            if (task.assigneeId != callerEmployeeId) throw UnauthorizedException("Not assigned to this task")
            val hasAdminOnlyFields = request.title != null || request.description != null ||
                    request.assigneeId != null || request.dueDate != null
            if (hasAdminOnlyFields) throw UnauthorizedException("Employees can only update status and progressPercent")
        }

        request.title?.let { task.title = it }
        request.description?.let { task.description = it }
        request.assigneeId?.let { task.assigneeId = it }
        request.status?.let { task.status = it }
        request.progressPercent?.let { task.progressPercent = it }
        request.dueDate?.let { task.dueDate = it }

        return taskRepository.save(task).toResponse()
    }

    @Transactional
    fun delete(id: UUID) {
        if (!taskRepository.existsById(id)) throw NotFoundException("Task not found")
        taskRepository.deleteById(id)
    }
}
