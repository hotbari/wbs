package com.company.workforce.api.skill.dto

import java.util.UUID

data class MergeSkillsRequest(val sourceId: UUID, val targetId: UUID)
