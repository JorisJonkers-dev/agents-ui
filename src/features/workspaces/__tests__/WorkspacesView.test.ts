import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import WorkspacesView from '../views/WorkspacesView.vue'

vi.mock('../components/ScratchTab.vue', () => ({
  default: { name: 'ScratchTab', template: '<div data-testid="scratch-tab-stub">Scratch panel</div>' },
}))

vi.mock('../components/WorkspaceTab.vue', () => ({
  default: { name: 'WorkspaceTab', template: '<div data-testid="workspace-tab-stub">Workspace panel</div>' },
}))

async function mountWorkspaces(path = '/workspaces') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/workspaces', component: WorkspacesView }],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(WorkspacesView, {
    global: {
      plugins: [router],
    },
  })
  return { router, wrapper }
}

describe('workspaces view (agents-api#68: Scratch + Repo-backed under one Workspaces home)', () => {
  it('defaults to the repo-backed tab, left-aligned home', async () => {
    const { wrapper } = await mountWorkspaces()

    expect(wrapper.classes()).toContain('max-w-6xl')
    expect(wrapper.classes()).toContain('p-6')
    expect(wrapper.classes()).not.toContain('mx-auto')
    expect(wrapper.get('h1').text()).toBe('Workspaces')
    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['Repo-backed', 'Scratch'])
    expect(wrapper.get('[data-testid="workspaces-tab-repo-backed"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[data-testid="workspace-tab-stub"]').exists()).toBe(true)
  })

  it('reads and writes the active tab from the route query', async () => {
    const { router, wrapper } = await mountWorkspaces('/workspaces?tab=scratch')

    expect(wrapper.get('[data-testid="workspaces-tab-scratch"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('[data-testid="scratch-tab-stub"]').exists()).toBe(true)

    await wrapper.get('[data-testid="workspaces-tab-repo-backed"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ tab: 'repo-backed' })
    expect(wrapper.get('[data-testid="workspaces-tab-repo-backed"]').attributes('aria-selected')).toBe('true')
  })

  it('has no unqualified Sessions/Chat language left on the page', async () => {
    const { wrapper } = await mountWorkspaces()

    expect(wrapper.text()).not.toContain('Sessions')
    expect(wrapper.text()).not.toContain('Chat')
  })
})
