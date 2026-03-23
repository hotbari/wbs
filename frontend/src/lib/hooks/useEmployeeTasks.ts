'use client'
import { useQuery } from '@tanstack/react-query'
import { getEmployeeTasks } from '@/lib/api/employeeTasks'

export function useEmployeeTasks(employeeId: string) {
  return useQuery({
    queryKey: ['employee-tasks', employeeId],
    queryFn: () => getEmployeeTasks(employeeId),
    enabled: !!employeeId,
  })
}
