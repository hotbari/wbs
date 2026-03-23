'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useProjectList } from '@/lib/hooks/useProjects'
import type { ProjectStatus } from '@/lib/types'
import { Button, Badge, Card, CardBody, Skeleton, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { Plus, FolderOpen } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'default'> = {
  ACTIVE: 'success', COMPLETED: 'info', ARCHIVED: 'default',
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: '진행 중', COMPLETED: '완료', ARCHIVED: '보관됨',
}

const filters: { label: string; value: ProjectStatus | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '진행 중', value: 'ACTIVE' },
  { label: '완료', value: 'COMPLETED' },
  { label: '보관됨', value: 'ARCHIVED' },
]

function ProjectCardSkeleton() {
  return <Card><CardBody className="space-y-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-1/4" /></CardBody></Card>
}

export default function ProjectsPage() {
  const [status, setStatus] = useState<ProjectStatus | undefined>()
  const { data, isLoading } = useProjectList({ status })

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">프로젝트</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted rounded-[var(--radius-lg)] p-0.5">
            {filters.map(f => (
              <button
                key={f.label}
                onClick={() => setStatus(f.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-[var(--radius-md)] transition-colors',
                  status === f.value ? 'bg-card text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link href="/admin/projects/new"><Button><Plus className="h-4 w-4" />새 프로젝트</Button></Link>
        </div>
      </div>
      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}</div>
      ) : !data?.data.length ? (
        <EmptyState icon={FolderOpen} heading="프로젝트가 없습니다" description="첫 번째 프로젝트를 생성해 보세요." />
      ) : (
        <StaggerList className="grid gap-4">
          {data.data.map(p => (
            <StaggerItem key={p.id}>
              <Link href={`/projects/${p.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardBody className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.phaseCount}개 페이즈 · {p.taskCount}개 업무</p>
                      <p className="text-xs text-muted-foreground">{p.startDate}{p.endDate ? ` → ${p.endDate}` : ''}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
                  </CardBody>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageTransition>
  )
}
