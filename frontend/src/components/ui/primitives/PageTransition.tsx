'use client'
import { motion } from 'framer-motion'
import { spring } from '@/lib/motion/presets'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.soft}
      className={className}
    >
      {children}
    </motion.div>
  )
}
