<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-md rounded-md border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
          <button
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="閉じる"
            @click="$emit('close')"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
