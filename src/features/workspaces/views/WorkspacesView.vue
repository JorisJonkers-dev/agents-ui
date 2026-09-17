<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScratchTab from '../components/ScratchTab.vue'
import WorkspaceTab from '../components/WorkspaceTab.vue'

type WorkspaceTabKey = 'repo-backed' | 'scratch'

const validTabs: WorkspaceTabKey[] = ['repo-backed', 'scratch']
const route = useRoute()
const router = useRouter()

function normalizedTab(value: unknown): WorkspaceTabKey {
  return validTabs.find((tab) => tab === value) ?? 'repo-backed'
}

const active = computed<WorkspaceTabKey>({
  get: () => normalizedTab(route.query.tab),
  set: (value) => {
    const { new: _omit, ...rest } = route.query
    void router.push({ path: '/workspaces', query: { ...rest, tab: value } })
  },
})

function activate(value: WorkspaceTabKey): void {
  active.value = value
}
</script>

<template>
  <div class="max-w-6xl p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Workspaces</h1>
      <p class="mt-1 text-sm text-[var(--color-text-muted)]">
        A Workspace is a persistent working directory an agent can run in. <strong>Repo-backed</strong> clones a
        project's repository so the agent can edit + push, and <strong>Scratch</strong> spawns a Pod with a shell but
        no git repo.
      </p>
    </header>

    <div data-testid="tabs">
      <div role="tablist" aria-label="Workspace kind" class="flex gap-1 border-b border-[var(--color-surface-border)]">
        <button
          type="button"
          role="tab"
          :aria-selected="active === 'repo-backed'"
          class="rounded-t px-4 py-2 text-sm transition-colors"
          :class="[
            active === 'repo-backed'
              ? 'bg-[var(--color-surface-elevated)] text-white border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          ]"
          data-testid="workspaces-tab-repo-backed"
          @click="activate('repo-backed')"
        >
          Repo-backed
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
          data-testid="workspaces-tab-scratch"
          @click="activate('scratch')"
        >
          Scratch
        </button>
      </div>

      <section v-if="active === 'repo-backed'" role="tabpanel" data-testid="tab-panel-repo-backed" class="mt-4">
        <WorkspaceTab />
      </section>
      <section v-if="active === 'scratch'" role="tabpanel" data-testid="tab-panel-scratch" class="mt-4">
        <ScratchTab />
      </section>
    </div>
  </div>
</template>
