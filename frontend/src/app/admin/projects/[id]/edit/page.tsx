'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/guards/AdminGuard'
import { useProject, useUpdateProject, useCreatePhase, useDeletePhase, useCreateTask } from '@/lib/hooks/useProjects'
import { Card, CardBody, Input, Button, PageTransition, PageHeader } from '@/components/ui/primitives'
import { Plus, Trash, ListPlus } from '@phosphor-icons/react'
import MemberAssignmentSection from '@/components/ui/MemberAssignmentSection'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project } = useProject(id)
  const { mutate: update, isPending } = useUpdateProject(id)
  const { mutate: createPhase } = useCreatePhase(id)
  const { mutate: deletePhase } = useDeletePhase(id)
  const { mutate: createTask } = useCreateTask(id)
  const [newPhase, setNewPhase] = useState({ name: '', startDate: '', endDate: '', orderIndex: '0' })
  const [newTaskPhaseId, setNewTaskPhaseId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  if (!project) return null

  return (
    <AdminGuard>
      <PageTransition>
        <div className="max-w-2xl space-y-8">
          <PageHeader
            eyebrow="관리자"
            heading={`수정: ${project.name}`}
            backTo={{ href: `/projects/${id}`, label: '프로젝트로 돌아가기' }}
            action={
              <Button
                variant="destructive"
                size="sm"
                loading={isPending}
                onClick={() => update({ status: 'ARCHIVED' }, { onSuccess: () => router.push('/projects') })}
              >
                프로젝트 보관
              </Button>
            }
          />

          <div>
            <h2 className="label-caps mb-3">페이즈</h2>
            {project.phases.map(phase => (
              <Card key={phase.id} className="mb-2">
                <CardBody className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{phase.name}</p>
                    <p className="text-xs text-muted-foreground">{phase.startDate} → {phase.endDate} (order: {phase.orderIndex})</p>
                    <p className="text-xs text-muted-foreground">{phase.tasks.length}개 업무</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setNewTaskPhaseId(phase.id)}>
                      <ListPlus className="h-3.5 w-3.5" />업무 추가
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePhase(phase.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive-light">
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}

            {newTaskPhaseId && (
              <Card className="mb-2 border-accent/30 bg-accent-light/30">
                <CardBody className="py-3">
                  <p className="text-xs font-medium mb-2">새 업무: {project.phases.find(p => p.id === newTaskPhaseId)?.name}</p>
                  <div className="flex gap-2">
                    <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                      placeholder="업무 제목" className="flex-1" />
                    <Button size="sm" onClick={() => createTask(
                      { phaseId: newTaskPhaseId, body: { title: newTaskTitle } },
                      { onSuccess: () => { setNewTaskPhaseId(null); setNewTaskTitle('') } }
                    )}>추가</Button>
                    <Button variant="ghost" size="sm" onClick={() => setNewTaskPhaseId(null)}>취소</Button>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card className="bg-muted/50">
              <CardBody className="space-y-3">
                <p className="text-sm font-medium">페이즈 추가</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="페이즈 이름" value={newPhase.name}
                    onChange={e => setNewPhase(f => ({ ...f, name: e.target.value }))}
                    className="col-span-2" />
                  <Input type="date" value={newPhase.startDate}
                    onChange={e => setNewPhase(f => ({ ...f, startDate: e.target.value }))} />
                  <Input type="date" value={newPhase.endDate}
                    onChange={e => setNewPhase(f => ({ ...f, endDate: e.target.value }))} />
                  <Input type="number" placeholder="순서" value={newPhase.orderIndex}
                    onChange={e => setNewPhase(f => ({ ...f, orderIndex: e.target.value }))} />
                </div>
                <Button onClick={() => createPhase(
                  { name: newPhase.name, startDate: newPhase.startDate,
                    endDate: newPhase.endDate, orderIndex: parseInt(newPhase.orderIndex) },
                  { onSuccess: () => setNewPhase({ name: '', startDate: '', endDate: '', orderIndex: '0' }) }
                )}>
                  <Plus className="h-4 w-4" />페이즈 추가
                </Button>
              </CardBody>
            </Card>
          </div>

          <MemberAssignmentSection projectId={id} projectName={project.name} />
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
