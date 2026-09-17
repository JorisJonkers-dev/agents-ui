// Public surface for the Conversations feature (chat with no Workspace).
//
// This directory is still named `sessions` on disk — the backend rename
// (chat_sessions, /chat-sessions) is a separate, blocked decision, and
// renaming the module tree to match the UI-facing "Conversations" name
// would touch far more files than this barrel's exports for no behavioural
// gain. Workspace/Scratch UI (which used to live alongside this feature's
// chat code) has moved to `@/features/workspaces`.
export { default as ChatTab } from './components/ChatTab.vue'
export { useChatSessionsStore } from './stores/chatSessions'
export type {
  AppendChatMessageInput,
  ChatMessage,
  ChatMessageRole,
  ChatSession,
  ChatSessionDetail,
  StartChatSessionInput,
} from './types'
export { default as ConversationsView } from './views/ConversationsView.vue'
