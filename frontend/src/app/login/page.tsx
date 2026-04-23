'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Input, Button } from '@/components/ui/primitives'
import { UsersThree, WarningCircle } from '@phosphor-icons/react'
import LoginVisualPanel from '@/components/ui/LoginVisualPanel'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } }
      setError(axiosErr.response?.status === 403
        ? '비활성화된 계정입니다'
        : '이메일 또는 비밀번호가 올바르지 않습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[100dvh]">
      {/* Left column — asymmetric top-left layout */}
      <div className="flex flex-col justify-between min-h-[100dvh] p-8 lg:p-12">
        {/* Logo top-left */}
        <div className="flex items-center gap-2">
          <UsersThree className="h-5 w-5 text-brand-mark" weight="duotone" />
          <span className="font-semibold text-foreground">Workforce</span>
        </div>

        {/* Form — vertically centered */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
          <div>
            <p className="label-section mb-2">인력 배치 관리 플랫폼</p>
            <h1 className="display-2">로그인</h1>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive-light border border-destructive/20 rounded-[var(--radius-md)] px-3 py-2">
              <WarningCircle className="h-4 w-4 shrink-0" weight="bold" />{error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">이메일</label>
              <Input type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">비밀번호</label>
              <Input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            로그인
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">© 2026 Workforce</p>
      </div>

      {/* Right column — floating tags visual */}
      <LoginVisualPanel />
    </div>
  )
}
