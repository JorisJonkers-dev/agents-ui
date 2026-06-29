import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'

describe('app', () => {
  it('renders without crashing', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/sessions', name: 'sessions', component: { template: '<div />' } },
        { path: '/sessions/workspace/:id', name: 'workspace-detail', component: { template: '<div />' } },
        { path: '/projects', name: 'projects', component: { template: '<div />' } },
        { path: '/repositories', name: 'repositories', component: { template: '<div />' } },
        { path: '/account', name: 'account', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: ['RouterView'],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
