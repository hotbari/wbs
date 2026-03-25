package com.company.workforce.api.project

import com.company.workforce.api.project.dto.*
import com.company.workforce.domain.project.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
class SidebarService(
    private val projectRepository: ProjectRepository,
    private val phaseRepository: PhaseRepository,
    private val taskRepository: ProjectTaskRepository
) {
    @Transactional(readOnly = true)
    fun getMyTasks(employeeId: UUID): List<MyTaskResponse> {
        return taskRepository.findByAssigneeIdAndStatusNotOrderByDueDateAsc(employeeId, TaskStatus.DONE)
            .map { task ->
                val phase = phaseRepository.findById(task.phaseId).orElseThrow()
                val project = projectRepository.findById(phase.projectId).orElseThrow()
                MyTaskResponse(
                    id = task.id, title = task.title, status = task.status,
                    progressPercent = task.progressPercent, dueDate = task.dueDate,
                    project = ProjectRef(project.id, project.name),
                    phase = PhaseRef(phase.id, phase.name)
                )
            }
    }

    @Transactional(readOnly = true)
    fun getEmployeeTasks(employeeId: UUID): List<MyTaskResponse> {
        return taskRepository.findByAssigneeIdOrderByCreatedAtAsc(employeeId)
            .map { task ->
                val phase = phaseRepository.findById(task.phaseId).orElseThrow()
                val project = projectRepository.findById(phase.projectId).orElseThrow()
                MyTaskResponse(
                    id = task.id, title = task.title, status = task.status,
                    progressPercent = task.progressPercent, dueDate = task.dueDate,
                    project = ProjectRef(project.id, project.name),
                    phase = PhaseRef(phase.id, phase.name)
                )
            }
    }

    @Transactional(readOnly = true)
    fun getProjectHealth(): List<ProjectHealthResponse> {
        return projectRepository.findAllBy(org.springframework.data.domain.Pageable.unpaged()).content
            .filter { it.status != ProjectStatus.ARCHIVED }
            .map { project ->
                val phases = phaseRepository.findByProjectIdOrderByOrderIndex(project.id)
                val phaseIds = phases.map { it.id }
                val total = if (phaseIds.isEmpty()) 0L else taskRepository.countByPhaseIdIn(phaseIds)
                val done = if (phaseIds.isEmpty()) 0L else taskRepository.countByPhaseIdInAndStatus(phaseIds, TaskStatus.DONE)
                val overdue = if (phaseIds.isEmpty()) 0L else taskRepository.countByPhaseIdInAndDueDateBeforeAndStatusNot(phaseIds, LocalDate.now(), TaskStatus.DONE)
                val completion = if (total == 0L) 0.0 else (done.toDouble() / total * 100)
                ProjectHealthResponse(
                    id = project.id, name = project.name, status = project.status,
                    phaseCount = phases.size, totalTaskCount = total,
                    inProgressTaskCount = if (phaseIds.isEmpty()) 0L else taskRepository.countByPhaseIdInAndStatus(phaseIds, TaskStatus.IN_PROGRESS),
                    overdueTaskCount = overdue,
                    completionPercent = Math.round(completion * 10.0) / 10.0
                )
            }
    }
}
