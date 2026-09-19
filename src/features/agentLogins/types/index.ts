// Types for the Agent Login feature.
//
// Hand-declared rather than imported from `@jorisjonkers-dev/agents-api-client`:
// the agent-logins endpoint landed in agents-api after 0.19.2, so the pinned
// client has no schema for it yet. Swap these for the generated
// `AgentLoginResponse` and `AgentLoginStatusResponse` on the next client bump —
// the shapes match the spec deliberately, so that should be an import and a
// delete, not a rewrite.

/** Agent Kinds that have a provider login. SHELL has none. */
export type AgentLoginKind = 'claude' | 'codex'

export interface AgentLogin {
  kind: AgentLoginKind
  /**
   * Whether the CLI has written its own login to the home volume. Presence
   * only — agents-api never reads the credential itself (ADR 0002).
   */
  present: boolean
}

export interface AgentLoginStatusResponse {
  logins: AgentLogin[]
}
