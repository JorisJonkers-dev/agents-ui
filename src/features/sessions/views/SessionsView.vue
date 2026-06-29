<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatTab from '../components/ChatTab.vue'
import ScratchTab from '../components/ScratchTab.vue'
import WorkspaceTab from '../components/WorkspaceTab.vue'

type SessionTab = 'workspace' | 'scratch' | 'chat'

const validTabs: SessionTab[] = ['workspace', 'scratch', 'chat']
const route = useRoute()
const router = useRouter()

function normalizedTab(value: unknown): SessionTab {
  return validTabs.find((tab) => tab === value) ?? 'workspace'
}

const active = computed<SessionTab>({
  get: () => normalizedTab(route.query.tab),
  set: (value) => {
    const { new: _omit, ...rest } = route.query
    void router.push({ path: '/sessions', query: { ...rest, tab: value } })
  },
})

function activate(value: SessionTab): void {
  active.value = value
}
</script>

<template>
  <div class="max-w-6xl p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Sessions</h1>
      <p class="mt-1 text-sm text-[var(--color-text-muted)]">
        Three flavours: <strong>Workspace</strong> clones a project's repository so the agent can edit +
        push, <strong>Scratch</strong> spawns a Pod with a shell but no git repo, and <strong>Chat</strong> is pure LLM
        Q&A (no Pod).
      </p>
    </header>

    <div data-testid="tabs">
      <div role="tablist" aria-label="Session flavour" class="flex gap-1 border-b border-[var(--color-surface-border)]">
        <button
          type="button"
          role="tab"
          :aria-selected="active === 'workspace'"
          class="rounded-t px-4 py-2 text-sm transition-colors"
          :class="[
            active === 'workspace'
              ? 'bg-[var(--color-surface-elevated)] text-white border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          ]"
          data-testid="sessions-tab-workspace"
          @click="activate('workspace')"
        >
          Workspace
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="active === 'scratch'"
          class="rounded-t px-4 py-2 text-sm transition-colors"
          :class="[
            active === 'scratch'
              ? 'bg-[var(--color-surface-elevated)] text-white border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          ]"
          data-testid="sessions-tab-scratch"
          @click="activate('scratch')"
        >
          Scratch
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="active === 'chat'"
          class="rounded-t px-4 py-2 text-sm transition-colors"
          :class="[
            active === 'chat'
              ? 'bg-[var(--color-surface-elevated)] text-white border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          ]"
          data-testid="sessions-tab-chat"
          @click="activate('chat')"
        >
          Chat
        </button>
      </div>

      <section v-if="active === 'workspace'" role="tabpanel" data-testid="tab-panel-workspace" class="mt-4">
        <WorkspaceTab />
      </section>
      <section v-if="active === 'scratch'" role="tabpanel" data-testid="tab-panel-scratch" class="mt-4">
        <ScratchTab />
      </section>
      <section
        v-show="active === 'chat'"
        role="tabpanel"
        data-testid="tab-panel-chat"
        class="mt-4"
        :hidden="active !== 'chat'"
      >
        <ChatTab />
      </section>
    </div>
  </div>
</template>
