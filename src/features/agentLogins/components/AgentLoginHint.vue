<script setup lang="ts">
import type { AgentLoginKind } from '../types'
import type { AgentKind, WorkspaceKind } from '@/features/workspaces'
import { computed, ref, watch } from 'vue'

interface Props {
  /** The session this terminal is showing, used to scope a dismissal. */
  sessionId: string
  agentKind: AgentKind
  workspaceKind: WorkspaceKind
  /** Set while a runner Pod backs the Workspace; null once it runs in-container. */
  podName: string | null
  /** Whether the provider has an Agent Login on the agents-api home volume. */
  loginPresent: boolean
}

const props = defineProps<Props>()

const LABELS: Record<AgentLoginKind, string> = { claude: 'Claude', codex: 'Codex' }
const DISMISS_PREFIX = 'agent-login-hint-dismissed:'

const kind = computed<AgentLoginKind | null>(() => {
  const value = String(props.agentKind).toLowerCase()
  return value === 'claude' || value === 'codex' ? value : null
})

// Mirrors agents-api's own rule (RunnerSessionBindingRouter): a Workspace runs
// in the agents-api container when it is Scratch *and* has no runner Pod.
// Anything else — Repo-backed, or a Scratch Workspace created before the move
// that still has a Pod — runs where the home volume is not mounted, so the
// container-wide answer says nothing about it and the hint stands regardless.
// agents-api#67 removes the Pod path and the two answers converge.
const podBacked = computed(() => !(props.workspaceKind === 'SCRATCH' && props.podName === null))

const dismissed = ref(false)

// Per session, and only for this tab: signing in is a one-off, but the Pod-backed
// hint cannot observe that it happened, so the user needs a way to put it away.
watch(
  () => props.sessionId,
  (id) => {
    dismissed.value = read(id)
  },
  { immediate: true },
)

function storageKey(id: string): string {
  return `${DISMISS_PREFIX}${id}`
}

function read(id: string): boolean {
  try {
    return window.sessionStorage.getItem(storageKey(id)) === '1'
  } catch {
    return false
  }
}

function dismiss(): void {
  dismissed.value = true
  try {
    window.sessionStorage.setItem(storageKey(props.sessionId), '1')
  } catch {
    // A blocked storage just means the hint returns on the next visit.
  }
}

const show = computed(() => kind.value !== null && !dismissed.value && (podBacked.value || !props.loginPresent))
const label = computed(() => (kind.value ? LABELS[kind.value] : ''))
const command = computed(() => (kind.value === 'codex' ? 'codex login' : '/login'))
</script>

<template>
  <aside
    v-if="show"
    class="flex items-start gap-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-card)] px-4 py-3"
    data-testid="agent-login-hint"
  >
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-[var(--color-text-primary)]">
        Sign in to {{ label }} from this terminal
      </p>
      <p class="mt-1 text-xs text-[var(--color-text-muted)]">
        <template v-if="podBacked">
          This workspace runs its session outside the shared home, so it needs its own sign-in.
        </template>
        <template v-else>
          No {{ label }} sign-in was found. Signing in once here covers every workspace that shares
          the home, and it survives a restart.
        </template>
        Run <code class="font-mono text-[var(--color-terminal-cyan)]">{{ command }}</code> and follow the prompt.
      </p>
    </div>
    <button
      type="button"
      class="shrink-0 rounded px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-light)]"
      data-testid="agent-login-hint-dismiss"
      @click="dismiss"
    >
      Dismiss
    </button>
  </aside>
</template>
