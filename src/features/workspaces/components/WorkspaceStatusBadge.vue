<script setup lang="ts">
import type { WorkspaceStatus } from '../types'
import { computed } from 'vue'
import { workspaceFailureReason, workspaceStatusTextClass } from '../lib/workspaceStatusPresentation'

const props = defineProps<{
  status: WorkspaceStatus
  failureReason?: string | null | undefined
}>()

const statusClass = computed(() => workspaceStatusTextClass(props.status))
const reason = computed(() => workspaceFailureReason(props.status, props.failureReason))
</script>

<template>
  <span class="flex flex-col items-end gap-0.5 text-right">
    <span class="text-xs" :class="statusClass" data-testid="workspace-status">{{ status }}</span>
    <span v-if="reason" class="text-xs text-[var(--color-text-muted)]" data-testid="workspace-status-reason">{{
      reason
    }}</span>
  </span>
</template>
