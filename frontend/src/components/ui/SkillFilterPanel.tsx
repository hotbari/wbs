'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listSkills } from '@/lib/api/skills'
import { Funnel, X } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Skill } from '@/lib/types'

interface Props {
  selectedSkillIds: string[]
  onChange: (ids: string[]) => void
}

export default function SkillFilterPanel({ selectedSkillIds, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: skills = [] } = useQuery({ queryKey: ['skills'], queryFn: () => listSkills() })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(id: string) {
    onChange(selectedSkillIds.includes(id) ? selectedSkillIds.filter(s => s !== id) : [...selectedSkillIds, id])
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-[var(--radius-md)] border transition-colors ${
          selectedSkillIds.length > 0
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border hover:border-accent/50'
        }`}
      >
        <Funnel className="h-4 w-4" />
        스킬 필터
        {selectedSkillIds.length > 0 && (
          <span className="bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
            {selectedSkillIds.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            style={{ transformOrigin: 'top left' }}
            className="absolute top-full left-0 mt-1 z-50 w-64 bg-card border border-border rounded-[var(--radius-lg)] shadow-lg p-2 max-h-64 overflow-y-auto"
          >
            {selectedSkillIds.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 px-2"
              >
                <X className="h-3 w-3" /> 전체 해제
              </button>
            )}
            {skills.map((skill: Skill) => (
              <label
                key={skill.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-muted cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedSkillIds.includes(skill.id)}
                  onChange={() => toggle(skill.id)}
                  className="rounded"
                />
                <span className="truncate">{skill.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{skill.category}</span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
