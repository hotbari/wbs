import { Badge } from '@/components/ui/primitives'
import { Star, StarHalf } from '@phosphor-icons/react'
import type { Proficiency } from '@/lib/types'

const variants: Record<Proficiency, 'success' | 'info' | 'default'> = {
  EXPERT: 'success', INTERMEDIATE: 'info', BEGINNER: 'default',
}

export default function SkillBadge({ name, proficiency }: { name: string; proficiency: Proficiency }) {
  return (
    <Badge variant={variants[proficiency]} className="gap-1">
      {proficiency === 'EXPERT' ? <Star weight="fill" className="h-3 w-3" /> :
       proficiency === 'INTERMEDIATE' ? <StarHalf weight="fill" className="h-3 w-3" /> :
       <Star className="h-3 w-3" />}
      {name}
    </Badge>
  )
}
