import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/lib/vueWebCommons'
import { assertNoDuplicateSiblingPaths, routeManifest } from './discovery'
import { createProtectedRouteGuard } from './guard'
import { legacySessionsRedirect, legacyWorkspaceDetailRedirect } from './legacyRedirects'

const shellRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/workspaces',
  },
  {
    // Bookmarked/linked from browser history under the old Sessions umbrella
    // (agents-api#68): `/sessions`, `/sessions?tab=workspace|scratch|chat`.
    path: '/sessions',
    redirect: legacySessionsRedirect,
  },
  {
    // Bookmarked/linked from browser history under the old Sessions umbrella.
    path: '/sessions/workspace/:id',
    redirect: legacyWorkspaceDetailRedirect,
  },
]

const routes: RouteRecordRaw[] = [
  ...shellRoutes,
  ...routeManifest.routes,
]

assertNoDuplicateSiblingPaths(routes, 'router')

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

const protectedRouteGuard = createProtectedRouteGuard(() => useAuth())
router.beforeEach((to) => protectedRouteGuard(to))
