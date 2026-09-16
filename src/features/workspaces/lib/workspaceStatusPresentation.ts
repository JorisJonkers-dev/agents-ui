import type { WorkspaceStatus } from '../types'

/**
 * Muted by default, matching every other status span in this app. FAILED
 * gets a distinct colour, mirroring the RUNNING/FAILED/other session-dot
 * precedent in SessionTabs.vue.
 */
export function workspaceStatusTextClass(status: WorkspaceStatus): string {
  return status === 'FAILED' ? 'text-red-400' : 'text-[var(--color-text-muted)]'
}

/**
 * Only a FAILED workspace with a non-blank reason gets one back, so
 * callers can skip rendering an element entirely rather than an empty one.
 */
export function workspaceFailureReason(status: WorkspaceStatus, failureReason?: string | null): string | null {
  if (status !== 'FAILED') {
    return null
  }
  const trimmed = failureReason?.trim()
  return trimmed || null
}
