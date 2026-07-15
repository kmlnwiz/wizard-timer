<script setup lang="ts">
import { computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

const emit = defineEmits<{ openSettings: [] }>()
const { mode, toggle } = useDarkMode()

const modeIconClass = computed(() => {
  if (mode.value === 'dark') return 'bi-moon-stars-fill'
  if (mode.value === 'light') return 'bi-sun-fill'
  return 'bi-display'
})
</script>

<template>
  <header class="flex items-center justify-between border-b border-gray-200 px-4 py-1.5 dark:border-gray-800">
    <h1 class="text-base font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">WIZARD TIMER</h1>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded-md px-2 py-1 text-base text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        :title="`ダークモード: ${mode}`"
        @click="toggle"
      >
        <i class="bi" :class="modeIconClass"></i>
      </button>
      <button
        type="button"
        class="rounded-md px-2 py-1 text-base text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        title="設定"
        @click="emit('openSettings')"
      >
        <i class="bi bi-gear-fill"></i>
      </button>
    </div>
  </header>
</template>
