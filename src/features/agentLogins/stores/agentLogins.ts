import type { AgentLoginKind } from '../types'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAgentLogins } from '../services/agentLoginsService'

/**
 * Which providers have an Agent Login on the home volume.
 *
 * Only ever drives a hint. A missing login never blocks starting an Agent
 * Session: the CLI prompts for sign-in in the terminal itself, and that
 * terminal is the only place a login can be created (ADR 0002). Treating
 * "unknown" as "signed in" is therefore the safe default — a hint that fails
 * to appear is recoverable from the prompt the CLI shows anyway, whereas
 * blocking the session removes the only route to signing in.
 */
export const useAgentLoginsStore = defineStore('agentLogins', () => {
  const present = ref<Record<AgentLoginKind, boolean>>({ claude: true, codex: true })
  const loaded = ref(false)
  const loading = ref(false)
  // Concurrent callers join the same request rather than being handed an
  // already-resolved promise: an `await load()` that returned before the first
  // read landed would see the defaults and suppress the hint.
  let inFlight: Promise<void> | null = null

  async function load(): Promise<void> {
    if (inFlight) return inFlight
    loading.value = true
    inFlight = (async () => {
      try {
        const { logins } = await getAgentLogins()
        for (const login of logins) present.value[login.kind] = login.present
        loaded.value = true
      } catch {
        // An unreachable endpoint is not worth an error surface of its own. The
        // session still starts and the CLI still prompts; the hint just stays
        // hidden. `loaded` stays false so ensureLoaded retries.
      } finally {
        loading.value = false
        inFlight = null
      }
    })()
    return inFlight
  }

  /** Load unless a previous attempt already succeeded. */
  async function ensureLoaded(): Promise<void> {
    if (loaded.value) return
    await load()
  }

  function isPresent(kind: AgentLoginKind): boolean {
    return present.value[kind]
  }

  return { present, loaded, loading, load, ensureLoaded, isPresent }
})
