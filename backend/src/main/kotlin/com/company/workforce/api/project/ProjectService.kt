package com.company.workforce.api.project

import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.common.PageResponse
import com.company.workforce.api.project.dto.*
import com.company.workforce.domain.project.*
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val phaseRepository: PhaseRepository,
    private val taskRepository: ProjectTaskRepository
) {
    @Transactional(readOnly = true)
    fun listAll(status: ProjectStatus?, pageable: Pageable): PageResponse<ProjectSummaryResponse> {
        val page = if (status != null)
            projectRepository.findByStatus(status, pageable)
        else
            projectRepository.findAllBy(pageable)

        return PageResponse(
            data = page.content.map { p ->
                val phases = phaseRepository.findByProjectIdOrderByOrderIndex(p.id)
                val phaseIds = phases.map { it.id }
                val taskCount = if (phaseIds.isEmpty()) 0L else taskRepository.countByPhaseIdIn(phaseIds)
                ProjectSummaryResponse(p.id, p.name, p.status, p.startDate, p.endDate, phases.size, taskCount)
            },
            page = pageable.pageNumber + 1,
            pageSize = pageable.pageSize,
            total = page.totalElements
        )
    }

    @Transactional(readOnly = true)
    fun getDetail(id: UUID): ProjectDetailResponse {
        val project = projectRepository.findById(id).orElseThrow { NotFoundException("Project not found") }
        return project.toDetail()
    }

    @Transactional
    fun create(request: CreateProjectRequest, createdBy: UUID): ProjectDetailResponse {
        if (projectRepository.existsByName(request.name))
            throw ConflictException("Project name already exists")
        val project = projectRepository.save(
            Project(
                name = request.name,
                description = request.description,
                startDate = request.startDate,
                endDate = request.endDate,
                createdBy = createdBy
            )
        )
        return project.toDetail()
    }

    @Transactional
    fun update(id: UUID, request: UpdateProjectRequest): ProjectDetailResponse {
        val project = projectRepository.findById(id).orElseThrow { NotFoundException("Project not found") }
        request.name?.let {
            if (projectRepository.existsByNameAndIdNot(it, id)) throw ConflictException("Project name already exists")
            project.name = it
        }
        request.description?.let { project.description = it }
        request.status?.let { project.status = it }
        request.startDate?.let { project.startDate = it }
        request.endDate?.let { project.endDate = it }
        return projectRepository.save(project).toDetail()
    }

    @Transactional
    fun archive(id: UUID): ProjectDetailResponse {
        val project = projectRepository.findById(id).orElseThrow { NotFoundException("Project not found") }
        project.status = ProjectStatus.ARCHIVED
        return projectRepository.save(project).toDetail()
    }

    private fun Project.toDetail(): ProjectDetailResponse {
        val phases = phaseRepository.findByProjectIdOrderByOrderIndex(id).map { phase ->
            val tasks = taskRepository.findByPhaseIdOrderByCreatedAtAsc(phase.id).map { it.toResponse() }
            phase.toResponse(tasks)
        }
        return ProjectDetailResponse(id, name, description, status, startDate, endDate, phases)
    }
}
