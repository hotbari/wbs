'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Skill } from '@/lib/types'

export function useSkillList(category?: string) {
  return useQuery({
    queryKey: ['skills', category],
    queryFn: async () => {
      const { data } = await apiClient.get<Skill[]>('/api/skills', {
        params: category ? { category } : undefined,
      })
      return data
    },
  })
}

export function useCreateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { name: string; category: string; description?: string }) => {
      const { data } = await apiClient.post<Skill>('/api/skills', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}

export function useUpdateSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name: string; category: string; description?: string }) => {
      const { data } = await apiClient.patch<Skill>(`/api/skills/${id}`, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}

export function useDeleteSkill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/skills/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['skills'] }),
  })
}
