'use client'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSharedView } from '@/lib/api/share'
import { Card, CardBody, ProgressBar } from '@/components/ui/primitives'

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', token],
    queryFn: () => getSharedView(token),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      불러오는 중...
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">링크를 찾을 수 없습니다</p>
        <p className="text-sm text-muted-foreground">링크가 만료되었거나 잘못된 주소입니다.</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div>
        <p className="text-xs text-muted-foreground mb-1">인력 배정 현황 (읽기 전용)</p>
        <h1 className="text-2xl font-semibold tracking-tight">{data.fullName}</h1>
        <p className="text-muted-foreground">{data.jobTitle} · {data.department}</p>
      </div>

      <Card>
        <CardBody className="space-y-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            현재 할당률 ({data.totalAllocationPercent}%)
          </h2>
          <ProgressBar value={data.totalAllocationPercent} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            프로젝트 배정 ({data.allocations.length}건)
          </h2>
          {data.allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground">배정된 프로젝트가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {data.allocations.map((a, i) => (
                <div key={i} className="flex justify-between text-sm border border-border rounded-[var(--radius-lg)] p-3">
                  <div>
                    <p className="font-medium">{a.projectName}</p>
                    <p className="text-muted-foreground">{a.roleInProject}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{a.allocationPercent}%</p>
                    <p className="text-xs text-muted-foreground">{a.startDate} – {a.endDate ?? '진행 중'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        이 링크는 30일 후 만료됩니다 · 생성: {new Date(data.generatedAt).toLocaleDateString('ko-KR')}
      </p>
    </div>
  )
}
