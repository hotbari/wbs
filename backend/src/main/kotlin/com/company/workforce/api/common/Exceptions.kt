package com.company.workforce.api.common

class UnauthorizedException(msg: String) : RuntimeException(msg)
class ForbiddenException(msg: String) : RuntimeException(msg)
class NotFoundException(msg: String) : RuntimeException(msg)
class ConflictException(msg: String) : RuntimeException(msg)
