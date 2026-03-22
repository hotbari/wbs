package com.company.workforce.api.project

import com.company.workforce.security.UserDetailsImpl
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class SidebarController(private val sidebarService: SidebarService) {

    @GetMapping("/api/me/tasks")
    fun myTasks(@AuthenticationPrincipal user: UserDetailsImpl) =
        sidebarService.getMyTasks(user.employeeId)

    @GetMapping("/api/admin/projects/health")
    @PreAuthorize("hasRole('ADMIN')")
    fun projectHealth() = sidebarService.getProjectHealth()
}
