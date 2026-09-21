import type { AppShellNavItem } from '@/lib/vueWebCommons'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import packageJson from '../../../package.json'
import AppShell from '../AppShell.vue'

vi.mock('@/lib/vueWebCommons', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    agentsThemeOptions: { storageKey: 'agents_theme' },
    useAuth: () => ({
      isAuthenticated: { value: true },
      user: { value: { role: 'USER' } },
      logout: () => Promise.resolve(),
      fetchUser: () => Promise.resolve(),
    }),
    AppShell: defineComponent({
      name: 'CommonsAppShell',
      props: {
        brandMain: String,
        layout: String,
        navItems: Array,
        newActionLabel: String,
        newActionTo: String,
        themeOptions: Object,
      },
      setup(_props, { slots }) {
        return () => h('div', { 'data-testid': 'commons-app-shell' }, slots.default?.())
      },
    }),
  }
})

describe('appShell navigation (agents-api#68: Workspaces / Conversations split)', () => {
  it('uses the published rail-capable commons package range', () => {
    expect(packageJson.dependencies['@jorisjonkers-dev/agents-api-client']).toBe('0.19.2')
    expect(packageJson.dependencies['@jorisjonkers-dev/auth-api-client']).toBe('0.8.0')
    expect(packageJson.dependencies['@jorisjonkers-dev/vue-web-commons']).toBe('0.4.1')
  })

  it('passes rail layout, two top-level nav items for Workspaces and Conversations, and a workspace-labelled new action', () => {
    const wrapper = mount(AppShell, {
      slots: { default: '<main data-testid="shell-slot" />' },
    })

    const shell = wrapper.getComponent({ name: 'CommonsAppShell' })
    const navItems: AppShellNavItem[] = shell.props('navItems')

    expect(shell.props('layout')).toBe('rail')
    expect(shell.props('newActionLabel')).toBe('New workspace')
    expect(shell.props('newActionTo')).toBe('/workspaces?new=1')
    expect(navItems.map((item) => item.label)).toEqual([
      'Workspaces',
      'Conversations',
      'Projects',
      'Repositories',
      'Account',
    ])
    expect(navItems.map((item) => item.icon)).toEqual(['window', 'chat', 'folder', 'git', 'user'])
  })

  it('nests Scratch and Repo-backed Workspaces under the single Workspaces nav item', () => {
    const wrapper = mount(AppShell, {
      slots: { default: '<main data-testid="shell-slot" />' },
    })

    const shell = wrapper.getComponent({ name: 'CommonsAppShell' })
    const navItems: AppShellNavItem[] = shell.props('navItems')
    const workspaces = navItems.find((item) => item.label === 'Workspaces')
    const conversations = navItems.find((item) => item.label === 'Conversations')

    expect(workspaces?.children?.map((item) => [item.label, item.to, item.icon])).toEqual([
      ['Repo-backed', '/workspaces?tab=repo-backed', 'window'],
      ['Scratch', '/workspaces?tab=scratch', 'terminal'],
    ])
    expect(conversations?.children).toBeUndefined()
  })
})
