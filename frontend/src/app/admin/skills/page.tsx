'use client'
import { useState } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import { useSkillList, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/lib/hooks/useSkills'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mergeSkills } from '@/lib/api/skills'
import type { Skill } from '@/lib/types'
import { Card, CardBody, Input, Button, EmptyState, PageTransition } from '@/components/ui/primitives'
import { PencilSimple, Trash, Tag, Plus, WarningCircle, ArrowsLeftRight } from '@phosphor-icons/react'

export default function AdminSkillsPage() {
  const { data: skills } = useSkillList()
  const { mutate: create, isPending: creating } = useCreateSkill()
  const { mutate: update } = useUpdateSkill()
  const { mutate: del, error: deleteError } = useDeleteSkill()
  const queryClient = useQueryClient()
  const { mutate: merge, isPending: merging } = useMutation({
    mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
      mergeSkills(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setMergeSourceId(null)
    },
  })

  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', category: '' })
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null)

  const deleteMsg = (deleteError as { response?: { data?: { message?: string } } } | null)?.response?.data?.message
  const mergeSource = skills?.find((s: Skill) => s.id === mergeSourceId)

  return (
    <AdminGuard>
      <PageTransition>
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">스킬 관리</h1>

          {mergeSourceId && (
            <div className="border border-warning/40 bg-warning/5 rounded-[var(--radius-lg)] px-4 py-3 text-sm">
              <p className="font-medium text-warning mb-1">병합 모드</p>
              <p className="text-muted-foreground">
                <strong>{mergeSource?.name}</strong>을(를) 병합할 대상 스킬을 클릭하세요.
                해당 스킬에 배정된 직원들이 대상 스킬로 이동됩니다.
              </p>
              <Button variant="ghost" size="sm" className="mt-2"
                onClick={() => setMergeSourceId(null)}>취소</Button>
            </div>
          )}

          <Card>
            <CardBody>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  create(
                    { name: newName, category: newCategory },
                    { onSuccess: () => { setNewName(''); setNewCategory('') } }
                  )
                }}
                className="flex gap-2"
              >
                <Input placeholder="스킬 이름" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1" required />
                <Input placeholder="카테고리" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-40" required />
                <Button type="submit" loading={creating}><Plus className="h-4 w-4" />추가</Button>
              </form>
            </CardBody>
          </Card>

          {deleteMsg && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive-light border border-destructive/20 rounded-[var(--radius-md)] px-3 py-2">
              <WarningCircle className="h-4 w-4 shrink-0" weight="bold" />{deleteMsg}
            </div>
          )}

          <Card>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left label-caps py-3 px-4">스킬 이름</th>
                    <th className="text-left label-caps py-3 px-4">카테고리</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {skills?.map((skill: Skill) => (
                    <tr
                      key={skill.id}
                      className={`border-b border-border last:border-0 ${
                        mergeSourceId && skill.id !== mergeSourceId
                          ? 'cursor-pointer hover:bg-warning/5'
                          : ''
                      } ${mergeSourceId === skill.id ? 'bg-warning/10' : ''}`}
                      onClick={() => {
                        if (merging) return
                        if (mergeSourceId && skill.id !== mergeSourceId) {
                          if (confirm(`"${mergeSource?.name}"을(를) "${skill.name}"으로 병합하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                            merge({ sourceId: mergeSourceId, targetId: skill.id })
                          }
                        }
                      }}
                    >
                      {editingId === skill.id ? (
                        <>
                          <td className="py-2 px-4">
                            <Input value={editForm.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          </td>
                          <td className="py-2 px-4">
                            <Input value={editForm.category}
                              onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} />
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => update(
                                { id: skill.id, ...editForm },
                                { onSuccess: () => setEditingId(null) }
                              )}>저장</Button>
                              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>취소</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4">{skill.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{skill.category}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm"
                                disabled={!!mergeSourceId}
                                onClick={e => {
                                  e.stopPropagation()
                                  setEditingId(skill.id)
                                  setEditForm({ name: skill.name, category: skill.category })
                                }}>
                                <PencilSimple className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm"
                                disabled={!!mergeSourceId}
                                onClick={e => {
                                  e.stopPropagation()
                                  setMergeSourceId(skill.id)
                                }}
                                title="이 스킬을 다른 스킬로 병합">
                                <ArrowsLeftRight className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm"
                                disabled={!!mergeSourceId}
                                onClick={e => { e.stopPropagation(); del(skill.id) }}
                                className="text-destructive hover:text-destructive hover:bg-destructive-light">
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {(!skills || skills.length === 0) && (
                    <tr>
                      <td colSpan={3}>
                        <EmptyState icon={Tag} heading="스킬이 없습니다" description="위에서 첫 번째 스킬을 추가하세요." className="py-8" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
