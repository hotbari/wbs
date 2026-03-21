package com.company.workforce.api.skill

import com.company.workforce.api.common.UnauthorizedException
import com.company.workforce.api.skill.dto.CreateSkillRequest
import com.company.workforce.api.skill.dto.EmployeeSkillRequest
import com.company.workforce.domain.user.UserRepository
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
class SkillController(
    private val skillService: SkillService,
    private val userRepository: UserRepository
) {
    @GetMapping("/api/skills")
    fun list(@RequestParam category: String?) = skillService.listAll(category)

    @GetMapping("/api/skills/{id}")
    fun getOne(@PathVariable id: UUID) = skillService.getOne(id)

    @PostMapping("/api/skills")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody req: CreateSkillRequest) = skillService.create(req)

    @PatchMapping("/api/skills/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: UUID, @Valid @RequestBody req: CreateSkillRequest) = skillService.update(id, req)

    @DeleteMapping("/api/skills/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: UUID) = skillService.delete(id)

    @GetMapping("/api/employees/{id}/skills")
    fun getEmployeeSkills(@PathVariable id: UUID) = skillService.getEmployeeSkills(id)

    @PostMapping("/api/employees/{id}/skills")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.CREATED)
    fun addSkill(
        @PathVariable id: UUID,
        @Valid @RequestBody req: EmployeeSkillRequest,
        @AuthenticationPrincipal ud: UserDetails
    ) = skillService.addSkillToEmployee(id, req, userRepository.findByEmail(ud.username)
        ?: throw UnauthorizedException("User not found"))

    @PatchMapping("/api/employees/{empId}/skills/{skillId}")
    @PreAuthorize("isAuthenticated()")
    fun updateSkill(
        @PathVariable empId: UUID, @PathVariable skillId: UUID,
        @Valid @RequestBody req: EmployeeSkillRequest,
        @AuthenticationPrincipal ud: UserDetails
    ) = skillService.updateEmployeeSkill(empId, skillId, req, userRepository.findByEmail(ud.username)
        ?: throw UnauthorizedException("User not found"))

    @DeleteMapping("/api/employees/{empId}/skills/{skillId}")
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun removeSkill(
        @PathVariable empId: UUID, @PathVariable skillId: UUID,
        @AuthenticationPrincipal ud: UserDetails
    ) = skillService.removeEmployeeSkill(empId, skillId, userRepository.findByEmail(ud.username)
        ?: throw UnauthorizedException("User not found"))
}
