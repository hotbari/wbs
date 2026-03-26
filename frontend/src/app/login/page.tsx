'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Input, Button } from '@/components/ui/primitives'
import { UsersThree, WarningCircle } from '@phosphor-icons/react'

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
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
            <p className="text-sm text-muted-foreground mt-1">계정 정보를 입력해 주세요</p>
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
      </div>
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-accent to-accent-dark p-12">
        <div className="text-white text-center max-w-md">
          <UsersThree className="h-16 w-16 mx-auto mb-6 opacity-90" weight="duotone" />
          <h2 className="text-3xl font-bold mb-3">인력 배치 관리</h2>
          <p className="text-accent-light text-lg">팀의 역량, 스킬, 프로젝트 배정을 한 곳에서 관리하세요.</p>
        </div>
      </div>
    </div>
  )
}
