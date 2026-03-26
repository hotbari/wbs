import Link from 'next/link'
import { Card, CardBody, Badge, ProgressBar } from '@/components/ui/primitives'
import type { ProjectHealth } from '@/lib/types'

export default function ProjectHealthCard({ health }: { health: ProjectHealth }) {
  return (
    <Link href={`/projects/${health.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-medium text-sm">{health.name}</span>
            <Badge variant={health.overdueTaskCount > 0 ? 'destructive' : 'success'}>
              {health.overdueTaskCount > 0 ? `${health.overdueTaskCount} overdue` : 'on track'}
            </Badge>
          </div>
          <ProgressBar value={health.completionPercent} />
          <p className="text-xs text-muted-foreground">{Math.round(health.completionPercent)}% complete · {health.phaseCount} phases</p>
        </CardBody>
      </Card>
    </Link>
  )
}
