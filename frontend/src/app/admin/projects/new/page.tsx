'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminGuard from '@/components/guards/AdminGuard'
import { useCreateProject } from '@/lib/hooks/useProjects'
import { Card, CardBody, Input, Textarea, Button, PageTransition } from '@/components/ui/primitives'
import { ArrowLeft, WarningCircle } from '@phosphor-icons/react'

export default function NewProjectPage() {
  const router = useRouter()
  const { mutate: create, isPending, error } = useCreateProject()
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' })

  const errMsg = (error as any)?.response?.data?.message

  return (
    <AdminGuard>
      <PageTransition>
        <div className="max-w-lg">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />Back to projects
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mb-6">New Project</h1>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <Input value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <Textarea value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Start Date *</label>
                  <Input type="date" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">End Date</label>
                  <Input type="date" value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              {errMsg && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <WarningCircle className="h-4 w-4 shrink-0" weight="bold" />{errMsg}
                </div>
              )}
              <Button
                disabled={!form.name || !form.startDate}
                loading={isPending}
                onClick={() => create(
                  { name: form.name, description: form.description || undefined,
                    startDate: form.startDate, endDate: form.endDate || undefined },
                  { onSuccess: (p) => router.push(`/projects/${p.id}`) }
                )}
              >
                Create Project
              </Button>
            </CardBody>
          </Card>
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
