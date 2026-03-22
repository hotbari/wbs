package com.company.workforce.api.project

import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.project.dto.*
import com.company.workforce.domain.project.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class PhaseService(
    private val projectRepository: ProjectRepository,
    private val phaseRepository: PhaseRepository,
    private val taskRepository: ProjectTaskRepository
) {
    @Transactional
    fun create(projectId: UUID, request: CreatePhaseRequest): PhaseResponse {
        if (!projectRepository.existsById(projectId)) throw NotFoundException("Project not found")
        if (request.endDate <= request.startDate) throw IllegalArgumentException("endDate must be after startDate")
        if (phaseRepository.existsByProjectIdAndOrderIndex(projectId, request.orderIndex))
            throw ConflictException("A phase with orderIndex ${request.orderIndex} already exists in this project")
        val phase = phaseRepository.save(
            Phase(projectId = projectId, name = request.name,
                startDate = request.startDate, endDate = request.endDate,
                orderIndex = request.orderIndex)
        )
        return phase.toResponse(emptyList())
    }

    @Transactional
    fun update(id: UUID, request: UpdatePhaseRequest): PhaseResponse {
        val phase = phaseRepository.findById(id).orElseThrow { NotFoundException("Phase not found") }
        request.name?.let { phase.name = it }
        request.startDate?.let { phase.startDate = it }
        request.endDate?.let { phase.endDate = it }
        request.orderIndex?.let { newIdx ->
            if (phaseRepository.existsByProjectIdAndOrderIndexAndIdNot(phase.projectId, newIdx, id))
                throw ConflictException("A phase with orderIndex $newIdx already exists")
            phase.orderIndex = newIdx
        }
        val tasks = taskRepository.findByPhaseIdOrderByCreatedAtAsc(phase.id).map { it.toResponse() }
        return phaseRepository.save(phase).toResponse(tasks)
    }

    @Transactional
    fun delete(id: UUID) {
        val phase = phaseRepository.findById(id).orElseThrow { NotFoundException("Phase not found") }
        if (taskRepository.countByPhaseIdIn(listOf(phase.id)) > 0)
            throw ConflictException("Cannot delete phase with tasks — delete tasks first")
        phaseRepository.delete(phase)
    }
}
