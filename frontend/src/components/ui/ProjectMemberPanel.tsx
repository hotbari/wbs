'use client'
import Link from 'next/link'
import type { PhaseDetail } from '@/lib/types'
import { Avatar, EmptyState } from '@/components/ui/primitives'
import { UsersThree } from '@phosphor-icons/react'

interface MemberInfo {
  id: string
  name: string
  taskCount: number
}

interface Props {
  phases: PhaseDetail[]
}

export default function ProjectMemberPanel({ phases }: Props) {
  const memberMap = new Map<string, MemberInfo>()
  for (const phase of phases) {
    for (const task of phase.tasks) {
      if (task.assigneeId && task.assigneeName) {
        const existing = memberMap.get(task.assigneeId)
        if (existing) {
          existing.taskCount++
        } else {
          memberMap.set(task.assigneeId, {
            id: task.assigneeId,
            name: task.assigneeName,
            taskCount: 1,
          })
        }
      }
    }
  }
  const members = Array.from(memberMap.values())

  return (
    <div className="hidden md:block w-52 shrink-0">
      <div className="sticky top-20 border border-border rounded-[var(--radius-xl)] p-4">
        <h3 className="label-caps mb-3">
          멤버 ({members.length})
        </h3>
        {members.length === 0 ? (
          <EmptyState icon={UsersThree} heading="배정된 멤버가 없습니다" className="py-4 text-xs" />
        ) : (
          <div className="space-y-3">
            {members.map(m => (
              <Link key={m.id} href={`/employees/${m.id}`} className="flex items-center gap-2 group">
                <Avatar name={m.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{m.name}</p>
                  <p className="text-xs text-muted-foreground"><span className="numeric">{m.taskCount}</span>개 업무</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
