<script setup lang="ts">
import { computed } from 'vue'
import { formatStopwatch } from '@/utils/time'
import { getMsUntilNextClock55 } from '@/utils/date'
import { useClock } from '@/composables/useClock'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const props = defineProps<{ currentLapElapsedMs: number; isRunning: boolean }>()

const stateLabel = computed(() => (props.isRunning ? '計測中' : '停止中'))

const { nowMs } = useClock()
const msUntilNext55 = computed(() => getMsUntilNextClock55(nowMs.value))
</script>

<template>
  <div class="text-center">
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ stateLabel }}</p>
    <p class="text-6xl font-bold text-gray-900 dark:text-gray-50 sm:text-7xl">
      <TabularDigits :text="formatStopwatch(currentLapElapsedMs)" />
    </p>
    <p class="mt-1 text-lg text-gray-500 dark:text-gray-400">
      次の55分まで
      <TabularDigits :text="formatStopwatch(msUntilNext55)" />
    </p>
  </div>
</template>
