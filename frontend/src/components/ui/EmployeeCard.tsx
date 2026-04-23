'use client'
import Link from 'next/link'
import { MotionCard, CardBody, Avatar, ProgressBar } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { EmployeeSummary } from '@/lib/types'

const PROF_DOTS = { BEGINNER: 1, INTERMEDIATE: 2, EXPERT: 3 } as const

export default function EmployeeCard({ employee }: { employee: EmployeeSummary }) {
  return (
    <Link href={`/employees/${employee.id}`} className="group block">
      <MotionCard className="spotlight-border h-full">
        <CardBody className="space-y-4 py-5">
          {/* Header: Avatar + name + department badge */}
          <div className="flex items-start gap-3">
            <Avatar name={employee.fullName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[0.9375rem] truncate group-hover:text-accent transition-colors">
                {employee.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{employee.jobTitle}</p>
              <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                {employee.department}
              </span>
            </div>
          </div>

          {/* Allocation bar + number */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <p className="label-section">배정률</p>
              <span className={cn(
                'text-xs font-mono font-medium',
                employee.totalAllocationPercent >= 100 ? 'text-destructive' :
                employee.totalAllocationPercent >= 80  ? 'text-warning' :
                'text-accent',
              )}>
                {employee.totalAllocationPercent}%
              </span>
            </div>
            <ProgressBar value={employee.totalAllocationPercent} size="sm" />
          </div>

          {/* Skills with proficiency dots */}
          {employee.topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {employee.topSkills.slice(0, 3).map(s => (
                <span
                  key={s.skillId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] bg-accent-light/40 text-xs font-medium text-accent-text"
                >
                  {s.name}
                  <span className="flex gap-0.5 ml-0.5">
                    {[1, 2, 3].map(n => (
                      <span
                        key={n}
                        className={cn(
                          'w-1 h-1 rounded-full',
                          n <= (PROF_DOTS[s.proficiency as keyof typeof PROF_DOTS] ?? 1)
                            ? 'bg-accent'
                            : 'bg-muted-foreground/30',
                        )}
                      />
                    ))}
                  </span>
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </MotionCard>
    </Link>
  )
}
