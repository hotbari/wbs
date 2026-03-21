package com.company.workforce.api.project

import com.company.workforce.api.project.dto.CreateProjectRequest
import com.company.workforce.api.project.dto.UpdateProjectRequest
import com.company.workforce.domain.project.ProjectStatus
import com.company.workforce.security.UserDetailsImpl
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/projects")
class ProjectController(private val projectService: ProjectService) {

    @GetMapping
    fun listAll(
        @RequestParam status: ProjectStatus?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = projectService.listAll(status, PageRequest.of(page - 1, pageSize))

    @GetMapping("/{id}")
    fun getDetail(@PathVariable id: UUID) = projectService.getDetail(id)

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @Valid @RequestBody request: CreateProjectRequest,
        @AuthenticationPrincipal user: UserDetailsImpl
    ) = projectService.create(request, user.userId)

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: UpdateProjectRequest
    ) = projectService.update(id, request)

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun archive(@PathVariable id: UUID) = projectService.archive(id)
}
