'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

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
        ? 'Account is deactivated'
        : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-80 space-y-4">
        <h1 className="text-xl font-semibold">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded p-2 text-sm" required />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded p-2 text-sm" required />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white rounded p-2 text-sm disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
