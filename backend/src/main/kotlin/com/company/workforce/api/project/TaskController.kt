package com.company.workforce.api.project

import com.company.workforce.api.project.dto.CreateTaskRequest
import com.company.workforce.api.project.dto.UpdateTaskRequest
import com.company.workforce.security.UserDetailsImpl
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class TaskController(private val taskService: TaskService) {

    @PostMapping("/api/phases/{phaseId}/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @PathVariable phaseId: UUID,
        @Valid @RequestBody request: CreateTaskRequest
    ) = taskService.create(phaseId, request)

    @PatchMapping("/api/tasks/{id}")
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: UpdateTaskRequest,
        @AuthenticationPrincipal user: UserDetailsImpl
    ): Any {
        val isAdmin = user.authorities.any { it.authority == "ROLE_ADMIN" }
        return taskService.update(id, request, user.employeeId, isAdmin)
    }

    @DeleteMapping("/api/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: UUID) = taskService.delete(id)
}
