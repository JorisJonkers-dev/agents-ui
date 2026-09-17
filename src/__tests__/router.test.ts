import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/vueWebCommons', () => ({
  useAuth: () => ({
    isAuthenticated: { value: false },
    user: { value: null },
    getAccessToken: () => null,
  }),
}))

describe('router', () => {
  it('has /workspaces route requiring auth', async () => {
    const { router } = await import('../router/index')
    const workspacesRoute = router.getRoutes().find((r) => r.path === '/workspaces')
    expect(workspacesRoute).toBeDefined()
    expect(workspacesRoute?.meta?.requiresAuth).toBe(true)
  })

  it('has /conversations route requiring auth', async () => {
    const { router } = await import('../router/index')
    const conversationsRoute = router.getRoutes().find((r) => r.path === '/conversations')
    expect(conversationsRoute).toBeDefined()
    expect(conversationsRoute?.meta?.requiresAuth).toBe(true)
  })

  it('redirects / to /workspaces', async () => {
    const { router } = await import('../router/index')
    const rootRoute = router.getRoutes().find((r) => r.path === '/')
    expect(rootRoute).toBeDefined()
    expect(rootRoute?.redirect).toBe('/workspaces')
  })

  it('exposes the workspace detail surface under /workspaces/:id', async () => {
    const { router } = await import('../router/index')
    const detailRoute = router.getRoutes().find((r) => r.path === '/workspaces/:id')
    expect(detailRoute).toBeDefined()
    expect(detailRoute?.name).toBe('workspace-detail')
    expect(detailRoute?.meta?.requiresAuth).toBe(true)
  })

  it('legacy /chat and bare /session routes are gone', async () => {
    const { router } = await import('../router/index')
    const paths = router.getRoutes().map((r) => r.path)
    expect(paths).not.toContain('/chat')
    expect(paths).not.toContain('/session')
  })

  it('workspaces route is named workspaces, conversations route is named conversations', async () => {
    const { router } = await import('../router/index')
    const workspacesRoute = router.getRoutes().find((r) => r.name === 'workspaces')
    expect(workspacesRoute).toBeDefined()
    expect(workspacesRoute?.path).toBe('/workspaces')

    const conversationsRoute = router.getRoutes().find((r) => r.name === 'conversations')
    expect(conversationsRoute).toBeDefined()
    expect(conversationsRoute?.path).toBe('/conversations')
  })

  it('keeps the old bookmarked /sessions* paths registered as redirects, not 404s', async () => {
    const { router } = await import('../router/index')

    const sessionsRoute = router.getRoutes().find((r) => r.path === '/sessions')
    expect(sessionsRoute).toBeDefined()
    expect(typeof sessionsRoute?.redirect).toBe('function')

    const workspaceDetailRedirect = router.getRoutes().find((r) => r.path === '/sessions/workspace/:id')
    expect(workspaceDetailRedirect).toBeDefined()
    expect(typeof workspaceDetailRedirect?.redirect).toBe('function')
  })
})
