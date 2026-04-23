import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
} as const

/** Neutral tone families — keeps avatars readable as "people" without the emerald-wall effect. */
const HASH_PALETTES = [
  'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-200',
  'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
] as const

function hashPalette(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = ((h * 31) + name.charCodeAt(i)) >>> 0
  }
  return HASH_PALETTES[h % HASH_PALETTES.length]
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: keyof typeof sizes
  /** `hash` (default) = deterministic neutral tone. `accent` = emerald — reserve for "current user" surfaces. */
  tone?: 'hash' | 'accent'
}

export function Avatar({ name, size = 'md', tone = 'hash', className, ...props }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const toneClass = tone === 'accent'
    ? 'bg-accent-light text-accent-dark'
    : hashPalette(name)

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0',
        sizes[size],
        toneClass,
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  )
}
