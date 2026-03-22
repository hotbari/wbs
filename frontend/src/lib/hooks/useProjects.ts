'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api/projects'

export function useProjectList(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => api.listProjects(params),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.getProject(id),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.updateProject(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', id] }),
  })
}

export function useArchiveProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.archiveProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useCreatePhase(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Parameters<typeof api.createPhase>[1]) => api.createPhase(projectId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', projectId] }),
  })
}

export function useDeletePhase(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deletePhase,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', projectId] }),
  })
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ phaseId, body }: { phaseId: string; body: Parameters<typeof api.createTask>[1] }) =>
      api.createTask(phaseId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', projectId] }),
  })
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api.updateTask(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', projectId] })
      qc.invalidateQueries({ queryKey: ['my-tasks'] })
    },
  })
}

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api.getComments(taskId),
    enabled: !!taskId,
  })
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => api.createComment(taskId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
  })
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
  })
}
