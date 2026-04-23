import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Returns true if dueDate (YYYY-MM-DD) is in the past and task is not done */
export function isOverdue(dueDate: string | null | undefined, status: string): boolean {
  if (!dueDate || status === 'DONE') return false
  return new Date(dueDate).getTime() < Date.now()
}

export { statusToProgress, statusToLabel } from './utils/status'
