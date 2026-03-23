import type { TaskStatus } from '@/lib/types'

export function statusToProgress(status: TaskStatus): number {
  switch (status) {
    case 'TODO': return 0
    case 'IN_PROGRESS': return 50
    case 'DONE': return 100
  }
}

export function statusToLabel(status: TaskStatus): string {
  switch (status) {
    case 'TODO': return '예정'
    case 'IN_PROGRESS': return '진행중'
    case 'DONE': return '완료'
  }
}
