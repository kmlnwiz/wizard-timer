<script setup lang="ts">
import { computed } from 'vue'
import type { LapRecord } from '@/types/lap'
import { formatLapDuration, formatJstClock } from '@/utils/time'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const props = defineProps<{
  lap: LapRecord
  index: number
  isFastest: boolean
  isSlowest: boolean
}>()

const emit = defineEmits<{ split: [LapRecord]; delete: [LapRecord] }>()

const durationClass = computed(() => {
  if (props.isFastest) return 'text-emerald-600 dark:text-emerald-400'
  if (props.isSlowest) return 'text-red-600 dark:text-red-400'
  return 'text-gray-900 dark:text-gray-100'
})
</script>

<template>
  <div class="flex items-center justify-between gap-2 border-b border-gray-100 py-2 dark:border-gray-800">
    <span class="text-sm text-gray-400 dark:text-gray-500">ラップ{{ index + 1 }}</span>
    <div class="flex shrink-0 items-center gap-2">
      <span class="text-xs text-gray-400 dark:text-gray-500">
        <TabularDigits :text="formatJstClock(new Date(lap.timestamp))" />
      </span>
      <p class="text-lg font-semibold" :class="durationClass">
        <TabularDigits :text="formatLapDuration(lap.lapDurationMs)" />
      </p>
      <button
        type="button"
        class="inline-flex h-7 w-12 items-center justify-center rounded bg-indigo-50 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900"
        @click="emit('split', lap)"
      >
        分割
      </button>
      <button
        type="button"
        class="inline-flex h-7 w-12 items-center justify-center rounded bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
        @click="emit('delete', lap)"
      >
        削除
      </button>
    </div>
  </div>
</template>
