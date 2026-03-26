import Link from 'next/link'
import { Card, CardBody, Avatar, ProgressBar } from '@/components/ui/primitives'
import type { EmployeeSummary } from '@/lib/types'

const PROFICIENCY_LABEL: Record<string, string> = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  EXPERT: '전문',
}

export default function EmployeeCard({ employee }: { employee: EmployeeSummary }) {
  return (
    <Link href={`/employees/${employee.id}`} className="group">
      <Card className="transition-shadow hover:shadow-md">
        <CardBody>
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={employee.fullName} />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">{employee.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{employee.jobTitle} · {employee.department}</p>
            </div>
          </div>
          <ProgressBar value={employee.totalAllocationPercent} />
          <p className={`text-xs mt-1.5 font-mono tabular-nums ${
            employee.totalAllocationPercent >= 100 ? 'text-destructive font-medium' :
            employee.totalAllocationPercent >= 80  ? 'text-warning font-medium' :
            'text-muted-foreground'
          }`}>
            {employee.totalAllocationPercent}% 배정됨
          </p>
          {employee.topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {employee.topSkills.map(s => (
                <span
                  key={s.skillId}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {s.name}
                  <span className="opacity-60">{PROFICIENCY_LABEL[s.proficiency] ?? s.proficiency}</span>
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </Link>
  )
}
