'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addEmployeeSkill, updateEmployeeSkill, removeEmployeeSkill } from '@/lib/api/skills'
import { apiClient } from '@/lib/api/client'
import type { EmployeeSkill } from '@/lib/types'

export function useMySkills(employeeId: string | undefined) {
  const qc = useQueryClient()

  const skillsQuery = useQuery({
    queryKey: ['employees', employeeId, 'skills'],
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeeSkill[]>(`/api/employees/${employeeId}/skills`)
      return data
    },
    enabled: !!employeeId,
  })

  const addSkill = useMutation({
    mutationFn: (body: { skillId: string; proficiency: string; certified?: boolean; note?: string }) =>
      addEmployeeSkill(employeeId!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', employeeId] }),
  })

  const updateSkill = useMutation({
    mutationFn: ({ skillId, ...body }: { skillId: string; proficiency: string; certified?: boolean; note?: string }) =>
      updateEmployeeSkill(employeeId!, skillId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', employeeId] }),
  })

  const removeSkill = useMutation({
    mutationFn: (skillId: string) => removeEmployeeSkill(employeeId!, skillId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', employeeId] }),
  })

  return { skillsQuery, addSkill, updateSkill, removeSkill }
}
