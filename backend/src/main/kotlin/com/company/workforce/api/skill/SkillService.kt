package com.company.workforce.api.skill

import com.company.workforce.api.common.ConflictException
import com.company.workforce.api.common.ForbiddenException
import com.company.workforce.api.common.NotFoundException
import com.company.workforce.api.skill.dto.CreateSkillRequest
import com.company.workforce.api.skill.dto.EmployeeSkillRequest
import com.company.workforce.domain.employee.EmployeeRepository
import com.company.workforce.domain.skill.EmployeeSkill
import com.company.workforce.domain.skill.EmployeeSkillRepository
import com.company.workforce.domain.skill.Skill
import com.company.workforce.domain.skill.SkillRepository
import com.company.workforce.domain.user.User
import com.company.workforce.domain.user.UserRepository
import com.company.workforce.domain.user.UserRole
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
@Transactional
class SkillService(
    private val skillRepository: SkillRepository,
    private val employeeSkillRepository: EmployeeSkillRepository,
    private val employeeRepository: EmployeeRepository,
    private val userRepository: UserRepository
) {
    @Transactional(readOnly = true)
    fun listAll(category: String?): List<Skill> =
        if (category != null) skillRepository.findByCategory(category)
        else skillRepository.findAll()

    @Transactional(readOnly = true)
    fun getOne(id: UUID): Skill = skillRepository.findById(id)
        .orElseThrow { NotFoundException("Skill not found") }

    fun create(request: CreateSkillRequest): Skill {
        if (skillRepository.existsByName(request.name)) throw ConflictException("Skill name already exists")
        return skillRepository.save(Skill(name = request.name, category = request.category, description = request.description))
    }

    fun update(id: UUID, request: CreateSkillRequest): Skill {
        val skill = getOne(id)
        if (skillRepository.existsByNameAndIdNot(request.name, id)) throw ConflictException("Name conflict")
        skill.name = request.name
        skill.category = request.category
        skill.description = request.description
        return skillRepository.save(skill)
    }

    fun delete(id: UUID) {
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

    private fun assertCanEditEmployee(employeeId: UUID, caller: User) {
        if (caller.role != UserRole.ADMIN && caller.employeeId != employeeId)
            throw ForbiddenException("Cannot edit another employee's skills")
    }
}
