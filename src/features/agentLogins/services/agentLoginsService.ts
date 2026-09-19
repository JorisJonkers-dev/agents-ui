import type { AgentLogin, AgentLoginKind, AgentLoginStatusResponse } from '../types'
import { useApiWithAuth } from '@/lib/vueWebCommons'

function api(): ReturnType<typeof useApiWithAuth> {
  return useApiWithAuth()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isKind(value: unknown): value is AgentLoginKind {
  return value === 'claude' || value === 'codex'
}

// Two ways to be unreadable, and they are not the same. An unrecognised `kind`
// is dropped: inventing one would put a hint on a provider that does not exist.
// A recognised kind whose `present` is missing or not a boolean reads as signed
// in, matching the store's own default — coercing it to `false` would show a
// sign-in hint to everyone the moment that field turned nullable.
function loginFrom(value: unknown): AgentLogin | null {
  if (!isRecord(value) || !isKind(value.kind)) return null
  return { kind: value.kind, present: typeof value.present === 'boolean' ? value.present : true }
}

export async function getAgentLogins(): Promise<AgentLoginStatusResponse> {
  const response = await api().get<unknown>('/agent-logins')
  const logins = isRecord(response) && Array.isArray(response.logins) ? response.logins : []
  return { logins: logins.map(loginFrom).filter((entry): entry is AgentLogin => entry !== null) }
}
