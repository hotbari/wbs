package com.company.workforce.api.share

import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class ShareController(private val shareService: ShareService) {

    @PostMapping("/api/employees/{id}/share")
    @PreAuthorize("hasRole('ADMIN')")
    fun createShareLink(@PathVariable id: UUID) = shareService.createShareLink(id)

    @GetMapping("/api/share/{token}")
    fun getSharedView(@PathVariable token: UUID) = shareService.resolveToken(token)
}
