interface Props { percent: number }
export default function AllocationBar({ percent }: Props) {
  const color = percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-yellow-400' : 'bg-green-500'
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )
}
