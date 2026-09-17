import type { LocationQuery, RouteLocationGeneric, RouteLocationRaw } from 'vue-router'

// The Sessions umbrella (agents-api#68) split into Workspaces and
// Conversations. `/sessions`, its `?tab=` variants, and
// `/sessions/workspace/:id` are bookmarked and linked from browser history,
// so they redirect rather than 404. Kept as plain functions (rather than
// inline in router/index.ts) so the mapping is unit-testable without
// exercising the router or the auth guard.

export function legacySessionsRedirect(to: RouteLocationGeneric): { path: string; query?: LocationQuery } {
  const { tab, new: keepNew, ...rest } = to.query

  if (tab === 'chat') {
    // vue-router inherits the source location's query/params/hash onto a
    // redirect target that doesn't specify its own — pass an empty query
    // explicitly so the old ?tab=chat doesn't leak onto /conversations.
    return { path: '/conversations', query: {} }
  }

  if (tab === 'scratch') {
    return { path: '/workspaces', query: { ...rest, tab: 'scratch' } }
  }

  // tab=workspace (the old default tab) or no tab at all: Workspaces' own
  // default tab is repo-backed, so no `tab` query is needed on the target.
  return { path: '/workspaces', query: keepNew === undefined ? rest : { ...rest, new: keepNew } }
}

export function legacyWorkspaceDetailRedirect(to: RouteLocationGeneric): RouteLocationRaw {
  return { name: 'workspace-detail', params: { id: to.params.id } }
}
