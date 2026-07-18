<script setup lang="ts">
import { computed } from 'vue'
import { formatJstClock, formatDurationHHMMSScc } from '@/utils/time'
import { getCurrentEventStart } from '@/utils/date'
import { useClock } from '@/composables/useClock'
import { useMondayCountdown } from '@/composables/useMondayCountdown'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const { nowMs } = useClock()
const { formatted: mondayCountdown } = useMondayCountdown()

// 秒までの表示にする(末尾のセンチ秒 .cc を除去)
const clockText = computed(() => formatJstClock(new Date(nowMs.value)).replace(/\.\d{2}$/, ''))
// 秒までの表示にする(末尾のセンチ秒 .cc を除去)
const elapsedText = computed(() =>
  formatDurationHHMMSScc(nowMs.value - getCurrentEventStart(new Date(nowMs.value))).replace(
    /\.\d{2}$/,
    '',
  ),
)
</script>

<template>
  <div class="grid grid-cols-3 gap-2 border-b border-gray-100 py-1 text-center dark:border-gray-800">
    <div>
      <p class="text-xs text-gray-500 dark:text-gray-400">現在時刻(JST)</p>
      <p class="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
        <TabularDigits :text="clockText" />
      </p>
    </div>
    <div>
      <p class="text-xs text-gray-500 dark:text-gray-400">金曜16:00からの経過</p>
      <p class="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
        <TabularDigits :text="elapsedText" />
      </p>
    </div>
    <div>
      <p class="text-xs text-gray-500 dark:text-gray-400">月曜16:00まで</p>
      <p class="text-lg font-bold text-indigo-600 dark:text-indigo-400 sm:text-2xl">
        <TabularDigits :text="mondayCountdown" />
      </p>
    </div>
  </div>
</template>
