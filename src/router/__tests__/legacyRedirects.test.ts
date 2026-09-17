import type { RouteLocationGeneric } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { legacySessionsRedirect, legacyWorkspaceDetailRedirect } from '../legacyRedirects'

function fakeTo(query: Record<string, string> = {}, params: Record<string, string> = {}): RouteLocationGeneric {
  // Only `query` and `params` are read by the redirect functions under test.
  return { query, params } as RouteLocationGeneric // eslint-disable-line ts/consistent-type-assertions
}

describe('legacy /sessions* redirects (agents-api#68)', () => {
  it('sends bare /sessions to Workspaces', () => {
    expect(legacySessionsRedirect(fakeTo())).toEqual({ path: '/workspaces', query: {} })
  })

  it('sends the old default tab=workspace to Workspaces', () => {
    expect(legacySessionsRedirect(fakeTo({ tab: 'workspace' }))).toEqual({ path: '/workspaces', query: {} })
  })

  it('sends tab=scratch to Workspaces with the scratch tab preselected', () => {
    expect(legacySessionsRedirect(fakeTo({ tab: 'scratch' }))).toEqual({
      path: '/workspaces',
      query: { tab: 'scratch' },
    })
  })

  it('sends tab=chat to Conversations, not a Workspaces tab', () => {
    expect(legacySessionsRedirect(fakeTo({ tab: 'chat' }))).toEqual({ path: '/conversations', query: {} })
  })

  it('keeps the ?new=1 create-workspace flag when redirecting the old new-workspace bookmark', () => {
    expect(legacySessionsRedirect(fakeTo({ tab: 'workspace', new: '1' }))).toEqual({
      path: '/workspaces',
      query: { new: '1' },
    })
  })

  it('sends the old workspace detail bookmark to the new detail path, keeping the id', () => {
    expect(legacyWorkspaceDetailRedirect(fakeTo({}, { id: 'ws-123' }))).toEqual({
      name: 'workspace-detail',
      params: { id: 'ws-123' },
    })
  })
})
