<script setup lang="ts">
import { computed } from 'vue'
import type { StatsResult } from '@/types/stats'
import { formatLapDuration, formatJstHm } from '@/utils/time'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const props = defineProps<{ stats: StatsResult }>()

const periodLabel = computed(() => {
  if (props.stats.periodStartMs === null || props.stats.periodEndMs === null) return null
  return `${formatJstHm(new Date(props.stats.periodStartMs))}〜${formatJstHm(new Date(props.stats.periodEndMs))}`
})

function formatPoints(v: number | null): string {
  return v !== null ? `${Math.round(v).toLocaleString()}pt/h` : '--'
}

function formatLapCount(v: number | null): string {
  return v !== null ? `(${Math.floor(v)}周)` : ''
}
</script>

<template>
  <div class="border-b border-gray-100 py-2 text-sm dark:border-gray-800">
    <div class="flex items-center justify-between">
      <span class="w-20 shrink-0 text-gray-500 dark:text-gray-400">
        {{ stats.rangeLabel }}
        <span v-if="periodLabel" class="block text-[11px] text-gray-400 dark:text-gray-500">{{ periodLabel }}</span>
      </span>
      <div class="flex flex-1 justify-around text-center">
        <div>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">平均</p>
          <p class="font-semibold text-gray-900 dark:text-gray-100">
            <TabularDigits :text="stats.averageLapMs !== null ? formatLapDuration(stats.averageLapMs) : '--:--.--'" />
          </p>
        </div>
        <div>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">最速</p>
          <p class="font-semibold text-emerald-600 dark:text-emerald-400">
            <TabularDigits :text="stats.fastestLapMs !== null ? formatLapDuration(stats.fastestLapMs) : '--:--.--'" />
          </p>
        </div>
        <div>
          <p class="text-[11px] text-gray-400 dark:text-gray-500">最遅</p>
          <p class="font-semibold text-red-600 dark:text-red-400">
            <TabularDigits :text="stats.slowestLapMs !== null ? formatLapDuration(stats.slowestLapMs) : '--:--.--'" />
          </p>
        </div>
      </div>
    </div>
    <div v-if="stats.maxPointsPerHour !== null" class="mt-1 flex justify-around text-center">
      <div>
        <p class="text-[11px] text-gray-400 dark:text-gray-500">最高時速</p>
        <p class="whitespace-nowrap font-semibold text-emerald-600 dark:text-emerald-400">
          <TabularDigits :text="formatPoints(stats.maxPointsPerHour)" />
          <span class="text-xs font-normal text-gray-400 dark:text-gray-500">{{
            formatLapCount(stats.maxPointsPerHourLapCount)
          }}</span>
        </p>
      </div>
      <div>
        <p class="text-[11px] text-gray-400 dark:text-gray-500">平均時速</p>
        <p class="whitespace-nowrap font-semibold text-indigo-600 dark:text-indigo-400">
          <TabularDigits :text="formatPoints(stats.avgPointsPerHour)" />
          <span class="text-xs font-normal text-gray-400 dark:text-gray-500">{{
            formatLapCount(stats.avgPointsPerHourLapCount)
          }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
