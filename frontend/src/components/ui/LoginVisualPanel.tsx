'use client'
import { motion } from 'framer-motion'

const TAGS = [
  { label: '백엔드 개발', delay: 0,   x: '10%', y: '15%', rotate: -8 },
  { label: '프로젝트 관리', delay: 0.8, x: '55%', y: '8%',  rotate: 5  },
  { label: 'React',        delay: 1.2, x: '75%', y: '25%', rotate: -3 },
  { label: '디자인 시스템', delay: 0.4, x: '5%',  y: '45%', rotate: 7  },
  { label: 'DevOps',       delay: 1.6, x: '60%', y: '42%', rotate: -12 },
  { label: '데이터 분석',   delay: 0.6, x: '20%', y: '65%', rotate: 4  },
  { label: 'TypeScript',   delay: 1.4, x: '10%', y: '82%', rotate: -4 },
]

export default function LoginVisualPanel() {
  return (
    <div className="relative overflow-hidden mesh-gradient min-h-[100dvh] hidden lg:block">
      {/* Large watermark text */}
      <div className="absolute inset-0 flex items-end p-12 pointer-events-none">
        <p
          className="font-bold leading-none tracking-tighter"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
          }}
        >
          인력<br />배치
        </p>
      </div>
      {/* Floating skill tags */}
      {TAGS.map((tag, i) => (
        <motion.div
          key={tag.label}
          className="absolute"
          style={{ left: tag.x, top: tag.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: tag.delay, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: tag.delay,
            }}
            className="inline-block px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm text-xs font-medium text-muted-foreground"
            style={{ rotate: tag.rotate }}
          >
            {tag.label}
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}
