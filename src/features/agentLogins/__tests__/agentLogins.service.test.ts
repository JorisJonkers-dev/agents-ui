import { describe, expect, it, vi } from 'vitest'
import { getAgentLogins } from '../services/agentLoginsService'

const get = vi.fn()
vi.mock('@/lib/vueWebCommons', () => ({ useApiWithAuth: () => ({ get }) }))

describe('agentLoginsService', () => {
  it('reads presence per provider', async () => {
    get.mockResolvedValue({ logins: [{ kind: 'claude', present: true }, { kind: 'codex', present: false }] })

    expect(await getAgentLogins()).toEqual({
      logins: [{ kind: 'claude', present: true }, { kind: 'codex', present: false }],
    })
  })

  // Inventing a provider the API did not send would put a hint on something
  // that does not exist.
  it('drops an entry whose kind it does not recognise', async () => {
    get.mockResolvedValue({ logins: [{ kind: 'gemini', present: false }, { kind: 'claude', present: false }] })

    expect(await getAgentLogins()).toEqual({ logins: [{ kind: 'claude', present: false }] })
  })

  // Unknown reads as signed in, matching the store. Coercing to false would
  // show a sign-in hint to everyone the moment the field turned nullable.
  it('treats a missing or non-boolean present as signed in', async () => {
    get.mockResolvedValue({ logins: [{ kind: 'claude' }, { kind: 'codex', present: 'true' }] })

    expect(await getAgentLogins()).toEqual({
      logins: [{ kind: 'claude', present: true }, { kind: 'codex', present: true }],
    })
  })

  it('reads an unexpected body as no logins rather than failing', async () => {
    get.mockResolvedValue('nope')

    expect(await getAgentLogins()).toEqual({ logins: [] })
  })
})
