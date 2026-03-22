import { ProgressBar } from '@/components/ui/primitives'

interface Props { percent: number }

export default function AllocationBar({ percent }: Props) {
  return <ProgressBar value={Math.min(percent, 100)} />
}
