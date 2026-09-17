<script setup lang="ts">
import ChatTab from '../components/ChatTab.vue'
</script>

<template>
  <div class="max-w-6xl p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Conversations</h1>
      <p class="mt-1 text-sm text-[var(--color-text-muted)]">
        A Conversation is a chat with an agent that has no Workspace — pure LLM Q&A against the knowledge base, with
        no Pod behind it.
      </p>
    </header>

    <ChatTab />
  </div>
</template>
