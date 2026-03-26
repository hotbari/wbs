export type UserRole = 'ADMIN' | 'PM' | 'EMPLOYEE'
export type EmploymentType = 'FULL_TIME' | 'CONTRACT' | 'PART_TIME'
export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'

export interface SkillTag {
  skillId: string
  name: string
  proficiency: Proficiency
}

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
  topSkills: SkillTag[]
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
  updatedAt: string
}

export interface Allocation {
  id: string
  employeeId: string
  employeeName?: string
  projectId: string | null
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

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface ProjectSummary {
  id: string
  name: string
  status: ProjectStatus
  startDate: string
  endDate: string | null
  phaseCount: number
  taskCount: number
}

export interface TaskItem {
  id: string
  phaseId: string
  title: string
  description: string | null
  assigneeId: string | null
  assigneeName: string | null
  status: TaskStatus
  dueDate: string | null
  createdAt: string
}

export interface PhaseDetail {
  id: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  orderIndex: number
  tasks: TaskItem[]
}

export interface ProjectDetail {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  startDate: string
  endDate: string | null
  phases: PhaseDetail[]
}

export interface Comment {
  id: string
  taskId: string
  author: { id: string; fullName: string }
  body: string
  createdAt: string
}

export interface MyTask {
  id: string
  title: string
  status: TaskStatus
  dueDate: string | null
  project: { id: string; name: string }
  phase: { id: string; name: string }
}

export interface ProjectHealth {
  id: string
  name: string
  status: ProjectStatus
  phaseCount: number
  totalTaskCount: number
  inProgressTaskCount: number
  overdueTaskCount: number
  completionPercent: number
}

export interface ShareLinkResponse {
  token: string
  url: string
  expiresAt: string
}

export interface SharedAllocationView {
  fullName: string
  jobTitle: string
  department: string
  totalAllocationPercent: number
  allocations: Array<{
    projectName: string
    roleInProject: string
    allocationPercent: number
    startDate: string
    endDate: string | null
  }>
  generatedAt: string
}

export interface AvailabilityPeriod {
  from: string
  to: string | null
  availablePercent: number
}
