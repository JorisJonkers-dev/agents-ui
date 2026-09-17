import type { FeatureRouteModule } from '@/router/types'

export default {
  feature: 'sessions',
  routes: [
    {
      path: '/conversations',
      name: 'conversations',
      component: () => import('@/features/sessions/views/ConversationsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
  navigation: [
    {
      id: 'conversations',
      label: 'Conversations',
      to: { name: 'conversations' },
      section: 'main',
      order: 11,
      icon: 'chat',
      requiresAuth: true,
    },
  ],
} satisfies FeatureRouteModule
