package com.company.workforce.domain.calendar

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface CalendarEventRepository : JpaRepository<CalendarEvent, UUID> {

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE (e.ownerUserId = :viewerId OR e.isPublic = true)
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findVisibleInRange(
        @Param("viewerId") viewerId: UUID,
        @Param("from") from: Instant,
        @Param("to") to: Instant
    ): List<CalendarEvent>

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE e.ownerUserId = :ownerId
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findByOwnerInRange(
        @Param("ownerId") ownerId: UUID,
        @Param("from") from: Instant,
        @Param("to") to: Instant
    ): List<CalendarEvent>

    @Query("""
        SELECT e FROM CalendarEvent e
        WHERE e.isPublic = true
          AND e.startAt < :to AND e.endAt > :from
        ORDER BY e.startAt
    """)
    fun findPublicInRange(
        @Param("from") from: Instant,
        @Param("to") to: Instant
    ): List<CalendarEvent>
}
