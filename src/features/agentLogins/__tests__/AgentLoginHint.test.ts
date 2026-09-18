import type { AgentKind, WorkspaceKind } from '@/features/workspaces'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import AgentLoginHint from '../components/AgentLoginHint.vue'

interface Options {
  agentKind?: AgentKind
  workspaceKind?: WorkspaceKind
  podName?: string | null
  loginPresent?: boolean
  sessionId?: string
}

function render(options: Options = {}) {
  return mount(AgentLoginHint, {
    props: {
      sessionId: options.sessionId ?? 's1',
      agentKind: options.agentKind ?? 'CLAUDE',
      workspaceKind: options.workspaceKind ?? 'SCRATCH',
      podName: options.podName ?? null,
      loginPresent: options.loginPresent ?? false,
    },
  })
}

const HINT = '[data-testid="agent-login-hint"]'
const DISMISS = '[data-testid="agent-login-hint-dismiss"]'

describe('agentLoginHint', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('hints when the provider has no Agent Login', () => {
    const wrapper = render({ loginPresent: false })

    expect(wrapper.find(HINT).exists()).toBe(true)
    expect(wrapper.text()).toContain('Sign in to Claude')
    expect(wrapper.text()).toContain('/login')
  })

  it('stays hidden when the provider is already signed in', () => {
    const wrapper = render({ loginPresent: true })

    expect(wrapper.find(HINT).exists()).toBe(false)
  })

  // A Shell Agent Session has no provider login at all.
  it('stays hidden for a Shell Agent Session', () => {
    const wrapper = render({ agentKind: 'SHELL', loginPresent: false })

    expect(wrapper.find(HINT).exists()).toBe(false)
  })

  // The endpoint answers for the agents-api container only. A Repo-backed
  // Workspace runs its session in a runner Pod with no access to that volume,
  // and agents-api#64 removed the Secret that used to supply one there.
  it('hints in a Repo-backed Workspace even when a login is present', () => {
    const wrapper = render({ workspaceKind: 'REPO_BACKED', podName: 'agent-runner-x', loginPresent: true })

    expect(wrapper.find(HINT).exists()).toBe(true)
    expect(wrapper.text()).toContain('outside the shared home')
  })

  // Mirrors agents-api's own rule: in-container means Scratch *and* no Pod. A
  // Scratch Workspace predating that move still runs in a Pod, so the
  // container-wide answer does not apply to it either.
  it('hints in a Scratch Workspace that still has a runner Pod', () => {
    const wrapper = render({ podName: 'agent-runner-legacy', loginPresent: true })

    expect(wrapper.find(HINT).exists()).toBe(true)
    expect(wrapper.text()).toContain('outside the shared home')
  })

  it('names the Codex sign-in command for a Codex session', () => {
    const wrapper = render({ agentKind: 'CODEX', loginPresent: false })

    expect(wrapper.text()).toContain('Sign in to Codex')
    expect(wrapper.text()).toContain('codex login')
  })

  // The Pod-backed hint cannot observe that the user signed in, so without this
  // it would sit in the terminal pane forever.
  it('can be dismissed, and stays dismissed for that session', async () => {
    const wrapper = render({ workspaceKind: 'REPO_BACKED', podName: 'agent-runner-x', loginPresent: true })

    await wrapper.get(DISMISS).trigger('click')

    expect(wrapper.find(HINT).exists()).toBe(false)
    expect(render({ workspaceKind: 'REPO_BACKED', podName: 'agent-runner-x', loginPresent: true }).find(HINT).exists()).toBe(false)
  })

  it('returns for a different session after one is dismissed', async () => {
    const first = render({ sessionId: 's1', loginPresent: false })
    await first.get(DISMISS).trigger('click')

    expect(render({ sessionId: 's2', loginPresent: false }).find(HINT).exists()).toBe(true)
  })
})
