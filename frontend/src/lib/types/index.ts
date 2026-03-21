export type UserRole = 'ADMIN' | 'EMPLOYEE'
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'PART_TIME'
export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  employeeId: string
}

export interface EmployeeSummary {
  id: string
  fullName: string
  email: string
  department: string
  team: string | null
  jobTitle: string
  employmentType: EmploymentType
  totalAllocationPercent: number
}

export interface EmployeeDetail extends EmployeeSummary {
  phone: string | null
  grade: string | null
  hiredAt: string
  isActive: boolean
  skills: EmployeeSkill[]
  assignments: Allocation[]
}

export interface Skill {
  id: string
  name: string
  category: string
  description?: string
}

export interface EmployeeSkill {
  id: string
  skillId: string
  proficiency: Proficiency
  certified: boolean
  note?: string
}

export interface Allocation {
  id: string
  employeeId: string
  projectName: string
  roleInProject: string
  allocationPercent: number
  startDate: string
  endDate: string | null
  isActive: boolean
}

export interface PageResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
}

export interface DashboardData {
  totalActiveEmployees: number
  avgAllocationPercent: number
  availableEmployees: EmployeeSummary[]
  topOverAllocated: Array<{ employee: EmployeeSummary; allocationPercent: number }>
}
