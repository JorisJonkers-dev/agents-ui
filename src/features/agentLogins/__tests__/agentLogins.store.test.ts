import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAgentLogins } from '../services/agentLoginsService'
import { useAgentLoginsStore } from '../stores/agentLogins'

vi.mock('../services/agentLoginsService', () => ({ getAgentLogins: vi.fn() }))
const mockedGet = vi.mocked(getAgentLogins)

describe('agent logins store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockedGet.mockReset()
  })

  it('records presence per provider', async () => {
    mockedGet.mockResolvedValue({ logins: [{ kind: 'claude', present: true }, { kind: 'codex', present: false }] })
    const store = useAgentLoginsStore()

    await store.load()

    expect(store.isPresent('claude')).toBe(true)
    expect(store.isPresent('codex')).toBe(false)
    expect(store.loaded).toBe(true)
  })

  // A hint that fails to appear is recoverable — the CLI prompts in the
  // terminal regardless. A hint shown to someone already signed in is noise on
  // every session start, so unknown reads as signed in.
  it('assumes a login is present before anything has loaded', () => {
    const store = useAgentLoginsStore()

    expect(store.isPresent('claude')).toBe(true)
    expect(store.loaded).toBe(false)
  })

  it('leaves presence alone and stays unloaded when the endpoint fails', async () => {
    mockedGet.mockRejectedValue(new Error('boom'))
    const store = useAgentLoginsStore()

    await store.load()

    expect(store.isPresent('claude')).toBe(true)
    expect(store.loaded).toBe(false)
  })

  // Joining rather than returning early: a caller that awaits must not be handed
  // a resolved promise before the first read has landed, or it reads the
  // defaults and suppresses the hint.
  it('joins an in-flight request instead of issuing a second', async () => {
    mockedGet.mockResolvedValue({ logins: [{ kind: 'claude', present: false }] })
    const store = useAgentLoginsStore()

    await Promise.all([store.load(), store.load()])

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(store.isPresent('claude')).toBe(false)
  })

  // RouterView reuses the view across /workspaces/:id, so onMounted fires once.
  // A transient failure on that first read must not suppress the hint for every
  // workspace visited afterwards.
  it('retries after a failure and stops once a read succeeds', async () => {
    mockedGet.mockRejectedValueOnce(new Error('boom'))
    mockedGet.mockResolvedValue({ logins: [{ kind: 'codex', present: false }] })
    const store = useAgentLoginsStore()

    await store.ensureLoaded()
    expect(store.loaded).toBe(false)

    await store.ensureLoaded()
    expect(store.isPresent('codex')).toBe(false)
    expect(mockedGet).toHaveBeenCalledTimes(2)

    await store.ensureLoaded()
    expect(mockedGet).toHaveBeenCalledTimes(2)
  })
})
