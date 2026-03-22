import Link from 'next/link'
import { Card, CardBody, Avatar, ProgressBar } from '@/components/ui/primitives'
import type { EmployeeSummary } from '@/lib/types'

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
          <p className="text-xs text-muted-foreground mt-1.5">{employee.totalAllocationPercent}% allocated</p>
        </CardBody>
      </Card>
    </Link>
  )
}
