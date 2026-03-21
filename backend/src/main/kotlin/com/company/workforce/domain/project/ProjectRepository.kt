package com.company.workforce.domain.project

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface ProjectRepository : JpaRepository<Project, UUID> {
    fun findByStatus(status: ProjectStatus, pageable: Pageable): Page<Project>
    fun findAllBy(pageable: Pageable): Page<Project>
    fun existsByName(name: String): Boolean
    fun existsByNameAndIdNot(name: String, id: UUID): Boolean
}
