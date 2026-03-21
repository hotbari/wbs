package com.company.workforce.api.allocation

import com.company.workforce.api.allocation.dto.CreateAllocationRequest
import com.company.workforce.api.allocation.dto.UpdateAllocationRequest
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/allocations")
class AllocationController(private val allocationService: AllocationService) {

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun listAll(
        @RequestParam employeeId: UUID?,
        @RequestParam projectName: String?,
        @RequestParam isActive: Boolean?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int
    ) = allocationService.listAll(employeeId, projectName, isActive, PageRequest.of(page - 1, pageSize))

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: CreateAllocationRequest) = allocationService.create(request)

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun update(@PathVariable id: UUID, @RequestBody request: UpdateAllocationRequest) =
        allocationService.update(id, request)

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun softDelete(@PathVariable id: UUID) = allocationService.softDelete(id)
}
