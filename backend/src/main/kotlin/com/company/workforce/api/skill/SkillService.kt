package com.company.workforce.api.skill

import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.skill.dto.CreateSkillRequest
import com.company.workforce.api.skill.dto.EmployeeSkillRequest
import com.company.workforce.api.skill.dto.SkillResponse
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.skill.EmployeeSkill
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.skill.Skill
import com.company.workforce.domain.skill.SkillRepository
import com.company.workforce.domain.user.User
import com.company.workforce.domain.user.UserRole
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

private fun Skill.toResponse() = SkillResponse(id = id, name = name, category = category, description = description)

@Service
@Transactional
class SkillService(
    private val skillRepository: SkillRepository,
    private val employeeSkillRepository: EmployeeSkillRepository,
    private val employeeRepository: EmployeeRepository
) {
    @Transactional(readOnly = true)
    fun listAll(category: String?): List<SkillResponse> =
        if (category != null) skillRepository.findByCategory(category).map { it.toResponse() }
        else skillRepository.findAll().map { it.toResponse() }

    @Transactional(readOnly = true)
    fun getOne(id: UUID): SkillResponse = skillRepository.findById(id)
        .orElseThrow { NotFoundException("Skill not found") }
        .toResponse()

    fun create(request: CreateSkillRequest): SkillResponse {
        if (skillRepository.existsByName(request.name)) throw ConflictException("Skill name already exists")
        return skillRepository.save(Skill(name = request.name, category = request.category, description = request.description)).toResponse()
    }

    fun update(id: UUID, request: CreateSkillRequest): SkillResponse {
        val skill = skillRepository.findById(id)
            .orElseThrow { NotFoundException("Skill not found") }
        if (skillRepository.existsByNameAndIdNot(request.name, id)) throw ConflictException("Name conflict")
        skill.name = request.name
        skill.category = request.category
        skill.description = request.description
        return skillRepository.save(skill).toResponse()
    }

    fun delete(id: UUID) {
        getOne(id) // throws NotFoundException if not found
        if (employeeSkillRepository.existsBySkillId(id)) throw ConflictException("Skill is in use")
        skillRepository.deleteById(id)
    }

    @Transactional(readOnly = true)
    fun getEmployeeSkills(employeeId: UUID): List<EmployeeSkill> =
        employeeSkillRepository.findByEmployeeId(employeeId)

    fun addSkillToEmployee(employeeId: UUID, request: EmployeeSkillRequest, caller: User): EmployeeSkill {
        assertCanEditEmployee(employeeId, caller)
        if (!employeeRepository.existsById(employeeId)) throw NotFoundException("Employee not found")
        if (!skillRepository.existsById(request.skillId)) throw NotFoundException("Skill not found")
        if (employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, request.skillId))
            throw ConflictException("Skill already assigned")
        return employeeSkillRepository.save(EmployeeSkill(
            employeeId = employeeId, skillId = request.skillId,
            proficiency = request.proficiency, certified = request.certified ?: false, note = request.note
        ))
    }

    fun updateEmployeeSkill(employeeId: UUID, skillId: UUID, request: EmployeeSkillRequest, caller: User): EmployeeSkill {
        assertCanEditEmployee(employeeId, caller)
        val es = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
            ?: throw NotFoundException("Skill not assigned")
        es.proficiency = request.proficiency
        request.certified?.let { es.certified = it }
        request.note?.let { es.note = it }
        return employeeSkillRepository.save(es)
    }

    fun removeEmployeeSkill(employeeId: UUID, skillId: UUID, caller: User) {
        assertCanEditEmployee(employeeId, caller)
        val es = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
            ?: throw NotFoundException("Skill not assigned")
        employeeSkillRepository.delete(es)
    }

    fun mergeSkills(sourceId: UUID, targetId: UUID) {
        if (sourceId == targetId) throw ConflictException("Source and target cannot be the same")
        val source = skillRepository.findById(sourceId).orElseThrow { NotFoundException("Source skill not found") }
        skillRepository.findById(targetId).orElseThrow { NotFoundException("Target skill not found") }

        val sourceAssignments = employeeSkillRepository.findBySkillId(sourceId)
        for (es in sourceAssignments) {
            val alreadyHasTarget = employeeSkillRepository.existsByEmployeeIdAndSkillId(es.employeeId, targetId)
            if (alreadyHasTarget) {
                employeeSkillRepository.delete(es)
            } else {
                employeeSkillRepository.delete(es)
                employeeSkillRepository.save(EmployeeSkill(
                    employeeId = es.employeeId,
                    skillId = targetId,
                    proficiency = es.proficiency,
                    certified = es.certified,
                    note = es.note
                ))
            }
        }
        skillRepository.delete(source)
    }

    private fun assertCanEditEmployee(employeeId: UUID, caller: User) {
        if (caller.role != UserRole.ADMIN && caller.employeeId != employeeId)
            throw ForbiddenException("Cannot edit another employee's skills")
    }
}
