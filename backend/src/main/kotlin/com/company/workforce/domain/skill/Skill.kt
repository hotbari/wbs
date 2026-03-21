package com.company.workforce.domain.skill

import jakarta.persistence.*
import java.util.UUID

@Entity
@Table(name = "skills")
class Skill(
    @Id val id: UUID = UUID.randomUUID(),
    var name: String,
    var category: String,
    var description: String? = null
)
