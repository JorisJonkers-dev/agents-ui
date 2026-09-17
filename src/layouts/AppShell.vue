<script setup lang="ts">
import type { AppShellNavItem } from '@/lib/vueWebCommons'
import type { NavigationItem } from '@/router/types'
import { computed } from 'vue'
import * as commons from '@/lib/vueWebCommons'
import { routeManifest } from '@/router/discovery'
import { buildAuthLogoutUrl } from '@/router/guard'
import { filterNavigation, navigationItems } from '@/router/navigation'

const { agentsThemeOptions, AppShell: CommonsAppShell } = commons
const hasAuthApi = typeof commons.useAuth === 'function'
const auth = hasAuthApi
  ? commons.useAuth()
  : {
      isAuthenticated: { value: false },
      user: { value: null },
      logout: async () => undefined,
    }

// Both Scratch and Repo-backed Workspaces live under the Workspaces nav item
// (agents-api#68): the glossary treats both as Workspace sub-kinds, not
// separate top-level concepts. Conversations has no sub-kinds, so it gets
// no children.
const workspaceChildren: AppShellNavItem[] = [
  { label: 'Repo-backed', to: '/workspaces?tab=repo-backed', testid: 'nav-workspaces-repo-backed', icon: 'window' },
  { label: 'Scratch', to: '/workspaces?tab=scratch', testid: 'nav-workspaces-scratch', icon: 'terminal' },
]

const routePathsByName = new Map(
  flattenRoutes(routeManifest.routes)
    .filter((route) => route.name !== undefined)
    .map((route) => [String(route.name), route.path]),
)

const navItems = computed<AppShellNavItem[]>(() =>
  filterNavigation(navigationItems, {
    isAuthenticated: auth.isAuthenticated.value,
    hasCapability: (capability) => capability === 'admin' && auth.user.value?.role === 'ADMIN',
  }).map(toAppShellNavItem),
)

function onLogout(): void {
  // Sign out through the auth-ui surface; it clears the shared session cookie
  // and redirects back to the sign-in page (same model as the other apps).
  if (typeof window !== 'undefined') window.location.href = buildAuthLogoutUrl()
}

function toAppShellNavItem(item: NavigationItem): AppShellNavItem {
  const navItem: AppShellNavItem = {
    label: item.label,
    to: navigationPath(item),
    testid: `nav-${item.id}`,
  }

  if (item.icon !== undefined) navItem.icon = item.icon
  if (item.id === 'workspaces') navItem.children = workspaceChildren

  return navItem
}

function navigationPath(item: NavigationItem): string {
  if (typeof item.to === 'string') return item.to
  if ('path' in item.to && typeof item.to.path === 'string') return item.to.path
  if ('name' in item.to && item.to.name !== undefined) {
    return routePathsByName.get(String(item.to.name)) ?? `/${String(item.to.name)}`
  }

  return '/'
}

function flattenRoutes(routes: typeof routeManifest.routes): typeof routeManifest.routes {
  return routes.flatMap((route) => [
    route,
    ...flattenRoutes(route.children ?? []),
  ])
}

const legacyNavItems: AppShellNavItem[] = [
  {
    label: 'Workspaces',
    to: '/workspaces',
    testid: 'nav-workspaces',
    icon: 'window',
    children: workspaceChildren,
  },
  { label: 'Conversations', to: '/conversations', testid: 'nav-conversations', icon: 'chat' },
  { label: 'Projects', to: '/projects', testid: 'nav-projects', icon: 'folder' },
  { label: 'Repositories', to: '/repositories', testid: 'nav-repositories', icon: 'git' },
]
</script>

<template>
  <CommonsAppShell
    brand-main="agents"
    layout="rail"
    new-action-label="New workspace"
    new-action-to="/workspaces?new=1"
    :nav-items="hasAuthApi ? navItems : legacyNavItems"
    :theme-options="agentsThemeOptions"
  >
    <template v-if="auth.isAuthenticated.value" #extras>
      <button
        type="button"
        class="flex h-11 w-full items-center gap-3 rounded-md px-3 font-mono text-sm text-[var(--color-text-muted)]
          transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-terminal-amber)]"
        data-testid="nav-logout"
        @click="onLogout"
      >
        <span aria-hidden="true">⏻</span>
        <span class="truncate">Sign out</span>
      </button>
    </template>
    <slot />
  </CommonsAppShell>
</template>
