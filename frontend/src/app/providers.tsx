'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import NavBar from '@/components/layout/NavBar'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } }
  }))
  return (
    <QueryClientProvider client={queryClient}>
      <NavBar />
      <main className="container mx-auto p-4">{children}</main>
    </QueryClientProvider>
  )
}
