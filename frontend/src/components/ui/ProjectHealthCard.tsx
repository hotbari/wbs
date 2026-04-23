'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardBody, Badge, ProgressBar } from '@/components/ui/primitives'
import type { ProjectHealth } from '@/lib/types'

export default function ProjectHealthCard({ health }: { health: ProjectHealth }) {
  return (
    <Link href={`/projects/${health.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="font-medium text-sm">{health.name}</span>
            <Badge variant={health.overdueTaskCount > 0 ? 'destructive' : 'success'}>
              {health.overdueTaskCount > 0 ? `${health.overdueTaskCount}개 지연` : '정상'}
            </Badge>
          </div>
          <ProgressBar value={health.completionPercent} />
          <p className="text-xs text-muted-foreground"><span className="numeric">{Math.round(health.completionPercent)}%</span> 완료 · <span className="numeric">{health.phaseCount}</span>개 페이즈</p>
        </CardBody>
      </Card>
      </motion.div>
    </Link>
  )
}
