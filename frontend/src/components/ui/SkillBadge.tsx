import type { Proficiency } from '@/lib/types'

const colors: Record<Proficiency, string> = {
  BEGINNER: 'bg-gray-100 text-gray-600',
  INTERMEDIATE: 'bg-blue-100 text-blue-700',
  EXPERT: 'bg-green-100 text-green-700',
}

export default function SkillBadge({ name, proficiency }: { name: string; proficiency: Proficiency }) {
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${colors[proficiency]}`}>
      {name} · {proficiency.toLowerCase()}
    </span>
  )
}
