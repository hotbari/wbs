import { Badge } from '@/components/ui/primitives'

interface Props {
  updatedAt: string
}

export default function SkillFreshnessBadge({ updatedAt }: Props) {
  const days = Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 30) return null
  const months = Math.floor(days / 30)
  const variant = days > 90 ? 'destructive' : 'warning'
  return (
    <Badge variant={variant} className="text-[10px] py-0">
      {months}개월 전 업데이트
    </Badge>
  )
}
