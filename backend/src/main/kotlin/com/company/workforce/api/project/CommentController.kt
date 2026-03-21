package com.company.workforce.api.project

import com.company.workforce.api.project.dto.CreateCommentRequest
import com.company.workforce.security.UserDetailsImpl
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class CommentController(private val commentService: CommentService) {

    @GetMapping("/api/tasks/{taskId}/comments")
    fun list(@PathVariable taskId: UUID) = commentService.list(taskId)

    @PostMapping("/api/tasks/{taskId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(
        @PathVariable taskId: UUID,
        @Valid @RequestBody request: CreateCommentRequest,
        @AuthenticationPrincipal user: UserDetailsImpl
    ) = commentService.create(taskId, request, user.userId)

    @DeleteMapping("/api/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: UserDetailsImpl
    ) {
        val isAdmin = user.authorities.any { it.authority == "ROLE_ADMIN" }
        commentService.delete(id, user.userId, isAdmin)
    }
}
