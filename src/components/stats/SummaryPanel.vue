<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import TabularDigits from '@/components/ui/TabularDigits.vue'
import SummaryChart from './SummaryChart.vue'
import { useSummary } from '@/composables/useSummary'
import { formatHours, formatFileTimestamp } from '@/utils/time'
import {
  STATS_LABELS,
  STATS_COLORS,
  formatLapTime,
  formatLapCount,
  formatHourlySpeed,
  formatAvgHourlySub,
  formatMaxHourlySub,
  formatTheoreticalHourlySub,
} from '@/utils/statsDisplay'

const { summary, hourlyLapCounts } = useSummary()

const captureEl = ref<HTMLElement | null>(null)
const isRendering = ref(false)
const previewUrl = ref<string | null>(null)
const previewFileName = ref('')

async function openPreview(): Promise<void> {
  if (!captureEl.value || isRendering.value) return
  isRendering.value = true
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(captureEl.value, {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
      scale: 2,
    })
    previewUrl.value = canvas.toDataURL('image/png')
    previewFileName.value = `wizard-timer_summary_${formatFileTimestamp(new Date())}.png`
  } finally {
    isRendering.value = false
  }
}

function closePreview(): void {
  previewUrl.value = null
}

function downloadPreview(): void {
  if (!previewUrl.value) return
  const a = document.createElement('a')
  a.href = previewUrl.value
  a.download = previewFileName.value
  a.click()
}
</script>

<template>
  <div>
    <div class="mb-1 flex items-center justify-between">
      <h2 class="text-base font-bold text-gray-900 dark:text-gray-100">サマリ</h2>
      <BaseButton variant="secondary" :disabled="isRendering" @click="openPreview">
        {{ isRendering ? '作成中...' : '画像として保存' }}
      </BaseButton>
    </div>

    <div ref="captureEl" class="space-y-4 py-2">
      <dl class="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.totalElapsed }}</dt>
          <dd class="text-base font-bold" :class="STATS_COLORS.neutral">
            <TabularDigits :text="formatHours(summary.totalElapsedMs)" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.totalLapCount }}</dt>
          <dd class="text-base font-bold" :class="STATS_COLORS.neutral">
            <TabularDigits :text="formatLapCount(summary.totalLapCount)" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.averageLap }}</dt>
          <dd class="text-base font-bold" :class="STATS_COLORS.neutral">
            <TabularDigits :text="formatLapTime(summary.averageLapMs)" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.fastestLap }}</dt>
          <dd class="text-base font-bold" :class="STATS_COLORS.fastest">
            <TabularDigits :text="formatLapTime(summary.fastestLapMs)" />
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.avgHourly }}</dt>
          <dd class="whitespace-nowrap text-base font-bold" :class="STATS_COLORS.neutral">
            <TabularDigits :text="formatHourlySpeed(summary.avgPointsPerHour, summary.avgPointsPerHourLapCount, 1)" />
            <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{
              formatAvgHourlySub(summary.avgPointsPerHour, summary.avgPointsPerHourLapCount)
            }}</span>
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.maxHourly }}</dt>
          <dd class="whitespace-nowrap text-base font-bold" :class="STATS_COLORS.maxHourly">
            <TabularDigits :text="formatHourlySpeed(summary.maxPointsPerHour, summary.maxPointsPerHourLapCount)" />
            <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{
              formatMaxHourlySub(
                summary.maxPointsPerHour,
                summary.maxPointsPerHourLapCount,
                summary.maxPointsPerHourRecordCount,
              )
            }}</span>
          </dd>
        </div>
        <div>
          <dt class="text-xs text-gray-500 dark:text-gray-400">{{ STATS_LABELS.theoreticalHourly }}</dt>
          <dd class="whitespace-nowrap text-base font-bold" :class="STATS_COLORS.theoretical">
            <TabularDigits :text="formatHourlySpeed(summary.theoreticalPointsPerHour, summary.theoreticalLapCount)" />
            <span class="block text-xs font-normal text-gray-500 dark:text-gray-400">{{
              formatTheoreticalHourlySub(summary.theoreticalLapCount, summary.fastestLapMs)
            }}</span>
          </dd>
        </div>
      </dl>

      <SummaryChart :series="hourlyLapCounts" />
    </div>

    <BaseModal :open="previewUrl !== null" title="画像プレビュー" max-width-class="max-w-2xl" @close="closePreview">
      <img v-if="previewUrl" :src="previewUrl" alt="サマリ画像プレビュー" class="w-full rounded-md" />
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        スマートフォンでは画像を長押しでも保存できます。
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <BaseButton variant="ghost" @click="closePreview">閉じる</BaseButton>
        <BaseButton variant="primary" @click="downloadPreview">保存</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
