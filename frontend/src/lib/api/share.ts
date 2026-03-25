import { apiClient } from './client'
import type { ShareLinkResponse, SharedAllocationView } from '../types'

export async function createShareLink(employeeId: string): Promise<ShareLinkResponse> {
  const { data } = await apiClient.post<ShareLinkResponse>(`/api/employees/${employeeId}/share`)
  return data
}

// Uses apiClient (base URL already configured). The share endpoint is public —
// any JWT in the request is ignored by Spring Security's permit-all rule.
export async function getSharedView(token: string): Promise<SharedAllocationView> {
  const { data } = await apiClient.get<SharedAllocationView>(`/api/share/${token}`)
  return data
}
