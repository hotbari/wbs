'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

interface StaggerListProps {
  children: React.ReactNode
  className?: string
}

export function StaggerList({ children, className }: StaggerListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerListProps) {
  return (
    <motion.div variants={item} className={cn(className)}>
      {children}
    </motion.div>
  )
}
