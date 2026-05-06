package com.company.workforce.api.common

import org.springframework.http.HttpStatus
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleUnauthorized(e: UnauthorizedException) = mapOf("message" to e.message)

    @ExceptionHandler(ForbiddenException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleForbidden(e: ForbiddenException) = mapOf("message" to e.message)

    @ExceptionHandler(NotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleNotFound(e: NotFoundException) = mapOf("message" to e.message)

    @ExceptionHandler(BadRequestException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleBadRequest(e: BadRequestException) = mapOf("message" to e.message)

    @ExceptionHandler(ConflictException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleConflict(e: ConflictException) = mapOf("message" to e.message)

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidation(e: MethodArgumentNotValidException): Map<String, Any> {
        val errors = e.bindingResult.fieldErrors.map {
            mapOf("field" to it.field, "message" to (it.defaultMessage ?: "Invalid"))
        }
        return mapOf("errors" to errors)
    }
}
