import type { ProjectHealth } from '@/lib/types'
import Link from 'next/link'

export default function ProjectHealthCard({ health }: { health: ProjectHealth }) {
  return (
    <Link href={`/projects/${health.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium text-sm">{health.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          health.overdueTaskCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          {health.overdueTaskCount > 0 ? `${health.overdueTaskCount} overdue` : 'on track'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${health.completionPercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">{Math.round(health.completionPercent)}% complete · {health.phaseCount} phases</p>
    </Link>
  )
}
