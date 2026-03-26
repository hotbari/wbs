package com.company.workforce.api.share

import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class ShareController(private val shareService: ShareService) {

    @PostMapping("/api/employees/{id}/share")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    fun createShareLink(@PathVariable id: UUID) = shareService.createShareLink(id)

    @PostMapping("/api/projects/{id}/share")
    @PreAuthorize("hasAnyRole('ADMIN', 'PM')")
    fun createProjectShareLink(@PathVariable id: UUID) = shareService.createProjectShareLink(id)

    @GetMapping("/api/share/{token}")
    fun getSharedView(@PathVariable token: UUID) = shareService.resolveToken(token)
}
