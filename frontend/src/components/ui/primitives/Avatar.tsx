import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
} as const

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: keyof typeof sizes
}

export function Avatar({ name, size = 'md', className, ...props }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-accent-light text-accent-dark font-semibold shrink-0',
        sizes[size],
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
