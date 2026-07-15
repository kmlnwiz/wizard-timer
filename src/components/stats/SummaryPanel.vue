<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TabularDigits from '@/components/ui/TabularDigits.vue'
import SummaryChart from './SummaryChart.vue'
import { useSummary } from '@/composables/useSummary'
import { formatHours, formatLapDuration, formatFileTimestamp } from '@/utils/time'

const { summary, hourlyLapCounts } = useSummary()

const captureEl = ref<HTMLElement | null>(null)
const isSaving = ref(false)

function formatPoints(v: number | null): string {
  return v !== null ? `${Math.round(v).toLocaleString()}pt/h` : '--'
}

function formatLapCount(v: number | null): string {
  return v !== null ? `(${Math.floor(v)}周)` : ''
}

async function saveAsImage(): Promise<void> {
  if (!captureEl.value || isSaving.value) return
  isSaving.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(captureEl.value, {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
      scale: 2,
    })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `wizard-timer_summary_${formatFileTimestamp(new Date())}.png`
    a.click()
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-1 flex items-center justify-between">
      <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">サマリ</h2>
      <BaseButton variant="secondary" :disabled="isSaving" @click="saveAsImage">画像として保存</BaseButton>
    </div>

    <div ref="captureEl" class="space-y-4 py-2">
      <dl class="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
        <div>
          <dt class="text-xs text-gray-400 dark:text-gray-500">合計時間</dt>
          <dd class="text-base font-bold text-gray-900 dark:text-gray-100">
            <TabularDigits :text="formatHours(summary.totalElapsedMs)" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-400 dark:text-gray-500">平均ラップ</dt>
          <dd class="text-base font-bold text-gray-900 dark:text-gray-100">
            <TabularDigits :text="summary.averageLapMs !== null ? formatLapDuration(summary.averageLapMs) : '--:--.--'" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-400 dark:text-gray-500">最速 / 最遅</dt>
          <dd class="whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100 sm:text-base">
            <TabularDigits :text="summary.fastestLapMs !== null ? formatLapDuration(summary.fastestLapMs) : '--:--.--'" />
            /
            <TabularDigits :text="summary.slowestLapMs !== null ? formatLapDuration(summary.slowestLapMs) : '--:--.--'" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-400 dark:text-gray-500">最高時速</dt>
          <dd class="whitespace-nowrap text-base font-bold text-emerald-600 dark:text-emerald-400">
            <TabularDigits :text="formatPoints(summary.maxPointsPerHour)" />
            <span class="block text-xs font-normal text-gray-400 dark:text-gray-500">{{
              formatLapCount(summary.maxPointsPerHourLapCount)
            }}</span>
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-400 dark:text-gray-500">平均時速</dt>
          <dd class="whitespace-nowrap text-base font-bold text-indigo-600 dark:text-indigo-400">
            <TabularDigits :text="formatPoints(summary.avgPointsPerHour)" />
            <span class="block text-xs font-normal text-gray-400 dark:text-gray-500">{{
              formatLapCount(summary.avgPointsPerHourLapCount)
            }}</span>
          </dd>
        </div>
      </dl>

      <SummaryChart :series="hourlyLapCounts" />
    </div>
  </div>
</template>
