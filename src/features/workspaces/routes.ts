import type { FeatureRouteModule } from '@/router/types'

export default {
  feature: 'workspaces',
  routes: [
    {
      path: '/workspaces',
      name: 'workspaces',
      component: () => import('@/features/workspaces/views/WorkspacesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces/:id',
      name: 'workspace-detail',
      component: () => import('@/features/workspaces/views/WorkspaceView.vue'),
      meta: { requiresAuth: true },
    },
  ],
  navigation: [
    {
      id: 'workspaces',
      label: 'Workspaces',
      to: { name: 'workspaces' },
      section: 'main',
      order: 10,
      icon: 'window',
      requiresAuth: true,
    },
  ],
} satisfies FeatureRouteModule
