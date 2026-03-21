package com.company.workforce.api.project

import com.company.workforce.api.project.dto.CreatePhaseRequest
import com.company.workforce.api.project.dto.UpdatePhaseRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@PreAuthorize("hasRole('ADMIN')")
class PhaseController(private val phaseService: PhaseService) {

    @PostMapping("/api/projects/{projectId}/phases")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: CreatePhaseRequest
    ) = phaseService.create(projectId, request)

    @PatchMapping("/api/phases/{id}")
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: UpdatePhaseRequest
    ) = phaseService.update(id, request)

    @DeleteMapping("/api/phases/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: UUID) = phaseService.delete(id)
}
