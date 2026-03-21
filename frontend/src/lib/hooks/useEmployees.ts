'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listEmployees, getEmployee, createEmployee, updateEmployee, deactivateEmployee } from '@/lib/api/employees'

export function useEmployeeList(params?: Parameters<typeof listEmployees>[0]) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => listEmployees(params),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  })
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => updateEmployee(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }) },
  })
}

export function useDeactivateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  })
}
