'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminGuard from '@/components/guards/AdminGuard'
import AllocationForm from '@/components/forms/AllocationForm'
import { useAllocations, useCreateAllocation, useDeactivateAllocation } from '@/lib/hooks/useAllocations'
import { Card, CardBody, Button, Badge, EmptyState, PageTransition } from '@/components/ui/primitives'
import { Plus, Prohibit, ListDashes } from '@phosphor-icons/react'

export default function AllocationsPage() {
  const { data } = useAllocations({ isActive: true })
  const { mutate: create, isPending, error: createError } = useCreateAllocation()
  const { mutate: deactivate } = useDeactivateAllocation()
  const [showForm, setShowForm] = useState(false)

  const conflictMsg = (createError as { response?: { data?: { message?: string } } } | null)?.response?.data?.message

  return (
    <AdminGuard>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold tracking-tight">Allocations</h1>
            <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'secondary' : 'primary'}>
              {showForm ? 'Cancel' : <><Plus className="h-4 w-4" />Add Allocation</>}
            </Button>
          </div>
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Card className="max-w-lg">
                  <CardBody>
                    <AllocationForm
                      onSubmit={(data) => create(data, { onSuccess: () => setShowForm(false) })}
                      isPending={isPending}
                      serverError={conflictMsg}
                    />
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">Employee</th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">Project</th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">Role</th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">%</th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">Start</th>
                      <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground py-3 px-4">End</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data.map(a => (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-xs text-muted-foreground">{a.employeeId.slice(0, 8)}...</td>
                        <td className="py-3 px-4">{a.projectName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{a.roleInProject}</td>
                        <td className="py-3 px-4">
                          <Badge variant={a.allocationPercent >= 90 ? 'danger' : a.allocationPercent >= 70 ? 'warning' : 'success'}>
                            {a.allocationPercent}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{a.startDate}</td>
                        <td className="py-3 px-4">{a.endDate ?? 'Ongoing'}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm" onClick={() => deactivate(a.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive-light">
                            <Prohibit className="h-3.5 w-3.5" />Deactivate
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!data || data.data.length === 0) && (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState icon={ListDashes} heading="No active allocations" className="py-8" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
