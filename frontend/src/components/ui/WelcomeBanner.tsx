'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, UsersThree, Briefcase, ShieldCheck } from '@phosphor-icons/react'
import type { UserRole } from '@/lib/types'

const DISMISS_KEY_PREFIX = 'workforce-welcome-v1-'

interface QuickAction {
  label: string
  href: string
}

interface RoleConfig {
  eyebrow: string
  heading: string
  body: string
  icon: React.ElementType
  actions: QuickAction[]
}

const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  ADMIN: {
    eyebrow: '관리자',
    heading: '전사 인력 현황을 한눈에 파악하세요',
    body: '직원 등록, 프로젝트 배치, 스킬 관리까지 — 시스템 전체를 여기서 관리합니다.',
    icon: ShieldCheck,
    actions: [
      { label: '직원 추가', href: '/admin/employees/new' },
      { label: '프로젝트 관리', href: '/admin/projects' },
      { label: '스킬 관리', href: '/admin/skills' },
    ],
  },
  PM: {
    eyebrow: '프로젝트 매니저',
    heading: '팀 배치 현황과 가용 인력을 확인하세요',
    body: '필요한 스킬을 가진 가용 인력을 검색하고 프로젝트 배치 상태를 추적합니다.',
    icon: Briefcase,
    actions: [
      { label: '내 프로젝트', href: '/pm' },
      { label: '인력 검색', href: '/employees' },
      { label: '배정 현황', href: '/pm/allocations' },
    ],
  },
  EMPLOYEE: {
    eyebrow: '인력 배치 플랫폼',
    heading: '현재 배정과 업무를 확인하세요',
    body: '프로젝트 배정 현황, 진행 중인 업무, 스킬 프로필을 한 곳에서 관리합니다.',
    icon: UsersThree,
    actions: [
      { label: '내 배정 현황', href: '/me' },
      { label: '프로젝트 목록', href: '/projects' },
      { label: '직원 현황', href: '/employees' },
    ],
  },
}

interface WelcomeBannerProps {
  userId: string
  role: UserRole
}

export default function WelcomeBanner({ userId, role }: WelcomeBannerProps) {
  const [visible, setVisible] = useState(false)
  const dismissKey = `${DISMISS_KEY_PREFIX}${userId}`

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(dismissKey)
    if (!dismissed) setVisible(true)
  }, [dismissKey])

  function dismiss() {
    localStorage.setItem(dismissKey, '1')
    setVisible(false)
  }

  const config = ROLE_CONFIG[role]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome-banner"
          initial={{ opacity: 0, y: -12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 480, damping: 32 }}
          className="mb-6"
        >
          {/* Outer bezel shell */}
          <div className="relative rounded-2xl p-[3px] bg-[color-mix(in_srgb,var(--accent)_8%,var(--foreground)_3%)] shadow-sm overflow-hidden">
            {/* Subtle accent gradient top edge */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--accent) 40%, transparent) 40%, color-mix(in srgb, var(--accent) 20%, transparent) 100%)' }}
            />
            {/* Inner core */}
            <div className="relative rounded-[calc(1rem-3px)] bg-card px-5 py-4 flex items-start gap-4"
              style={{ boxShadow: 'inset 0 1px 1px rgb(255 255 255 / 0.8)' }}
            >
              {/* Icon column */}
              <div
                className="shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
              >
                <Icon
                  className="h-5 w-5"
                  style={{ color: 'var(--accent)' }}
                  weight="duotone"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="eyebrow">{config.eyebrow}</span>
                </div>
                <h2 className="heading-2 mb-1">{config.heading}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{config.body}</p>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-2">
                  {config.actions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={dismiss}
                      className="welcome-action-link inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 hover:shadow-sm"
                      style={{
                        borderColor: 'color-mix(in srgb, var(--accent) 25%, var(--border))',
                        color: 'var(--accent-text)',
                      }}
                    >
                      {action.label}
                      <ArrowRight className="h-3 w-3" weight="bold" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                aria-label="닫기"
                className="shrink-0 -mt-0.5 -mr-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
