<script setup lang="ts">
import { computed } from 'vue'
import type { StatsResult } from '@/types/stats'
import { formatJstHm } from '@/utils/time'
import TabularDigits from '@/components/ui/TabularDigits.vue'
import {
  STATS_LABELS,
  STATS_COLORS,
  formatLapTime,
  formatHourlySpeed,
  formatAvgHourlySub,
  formatMaxHourlySub,
} from '@/utils/statsDisplay'

const props = defineProps<{ stats: StatsResult }>()

const periodLabel = computed(() => {
  if (props.stats.periodStartMs === null || props.stats.periodEndMs === null) return null
  return `${formatJstHm(new Date(props.stats.periodStartMs))}〜${formatJstHm(new Date(props.stats.periodEndMs))}`
})
</script>

<template>
  <div class="border-b border-gray-100 py-1 text-sm dark:border-gray-800">
    <div class="mb-1 text-gray-500 dark:text-gray-400">
      {{ stats.rangeLabel }}
      <span v-if="periodLabel" class="text-[11px] text-gray-500 dark:text-gray-400">{{ periodLabel }}</span>
    </div>
    <div class="flex items-start justify-between gap-1 text-center">
      <div class="flex-1">
        <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ STATS_LABELS.averageLap }}</p>
        <p class="font-semibold" :class="STATS_COLORS.neutral">
          <TabularDigits :text="formatLapTime(stats.averageLapMs)" />
        </p>
      </div>
      <div class="flex-1">
        <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ STATS_LABELS.fastestLap }}</p>
        <p class="font-semibold" :class="STATS_COLORS.fastest">
          <TabularDigits :text="formatLapTime(stats.fastestLapMs)" />
        </p>
      </div>
      <div class="flex-1">
        <p class="text-[11px] text-gray-500 dark:text-gray-400">
          {{ stats.showMaxHourly ? STATS_LABELS.avgHourly : STATS_LABELS.hourly }}
        </p>
        <p class="font-semibold" :class="STATS_COLORS.neutral">
          <TabularDigits :text="formatHourlySpeed(stats.avgPointsPerHour, stats.avgPointsPerHourLapCount, 1)" />
          <span class="text-[10px] font-normal text-gray-500 dark:text-gray-400">{{
            formatAvgHourlySub(stats.avgPointsPerHour, stats.avgPointsPerHourLapCount)
          }}</span>
        </p>
      </div>
      <div v-if="stats.showMaxHourly" class="flex-1">
        <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ STATS_LABELS.maxHourly }}</p>
        <p class="font-semibold" :class="STATS_COLORS.maxHourly">
          <TabularDigits :text="formatHourlySpeed(stats.maxPointsPerHour, stats.maxPointsPerHourLapCount)" />
          <span class="text-[10px] font-normal text-gray-500 dark:text-gray-400">{{
            formatMaxHourlySub(stats.maxPointsPerHour, stats.maxPointsPerHourLapCount)
          }}</span>
        </p>
      </div>
    </div>
  </div>
</template>
