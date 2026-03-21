package com.company.workforce.api.project

import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.common.UnauthorizedException
import com.company.workforce.api.project.dto.*
import com.company.workforce.domain.project.*
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.user.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class CommentService(
    private val taskRepository: ProjectTaskRepository,
    private val commentRepository: TaskCommentRepository,
    private val userRepository: UserRepository,
    private val employeeRepository: EmployeeRepository
) {
    @Transactional(readOnly = true)
    fun list(taskId: UUID): List<CommentResponse> {
        if (!taskRepository.existsById(taskId)) throw NotFoundException("Task not found")
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).map { it.toResponse() }
    }

    @Transactional
    fun create(taskId: UUID, request: CreateCommentRequest, authorUserId: UUID): CommentResponse {
        if (!taskRepository.existsById(taskId)) throw NotFoundException("Task not found")
        val comment = commentRepository.save(
            TaskComment(taskId = taskId, authorId = authorUserId, body = request.body)
        )
        return comment.toResponse()
    }

    @Transactional
    fun delete(id: UUID, callerUserId: UUID, isAdmin: Boolean) {
        val comment = commentRepository.findById(id).orElseThrow { NotFoundException("Comment not found") }
        if (!isAdmin && comment.authorId != callerUserId)
            throw UnauthorizedException("Cannot delete another user's comment")
        commentRepository.delete(comment)
    }

    private fun TaskComment.toResponse(): CommentResponse {
        val user = userRepository.findById(authorId).orElseThrow { NotFoundException("User not found") }
        val employee = employeeRepository.findById(user.employeeId).orElseThrow { NotFoundException("Employee not found") }
        return CommentResponse(id, taskId, AuthorInfo(user.id, employee.fullName), body, createdAt)
    }
}
