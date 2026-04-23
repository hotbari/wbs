'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fade } from '@/lib/motion/presets'
import { Input } from '@/components/ui/primitives'
import type { Skill } from '@/lib/types'

interface Props {
  skills: Skill[]
  exclude: string[]
  onSelect: (skill: Skill) => void
  placeholder?: string
}

export default function SkillAutocomplete({ skills, exclude, onSelect, placeholder = '스킬 검색...' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = skills
    .filter(s => !exclude.includes(s.id))
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) ||
                 s.category.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleSelect = useCallback((skill: Skill) => {
    onSelect(skill)
    setQuery('')
    setOpen(false)
  }, [onSelect])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[activeIndex]) handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={fade.fast}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-[var(--radius-md)] shadow-lg max-h-52 overflow-y-auto"
          >
            {filtered.map((skill, i) => (
              <li
                key={skill.id}
                onMouseDown={() => handleSelect(skill)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${
                  i === activeIndex ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <span>{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.category}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
