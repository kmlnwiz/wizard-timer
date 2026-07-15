<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatJstClock, formatDurationDHMS } from '@/utils/time'
import { getCurrentEventStart } from '@/utils/date'
import { useClock } from '@/composables/useClock'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const { nowMs } = useClock()

const showElapsed = ref(false)

const clockText = computed(() => formatJstClock(new Date(nowMs.value)))
const elapsedText = computed(() =>
  formatDurationDHMS(nowMs.value - getCurrentEventStart(new Date(nowMs.value))),
)
</script>

<template>
  <button type="button" class="rounded text-center" @click="showElapsed = !showElapsed">
    <p class="text-xs text-gray-400 dark:text-gray-500">
      {{ showElapsed ? '金曜16:00からの経過' : '現在時刻(JST)' }}
    </p>
    <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
      <TabularDigits :text="showElapsed ? elapsedText : clockText" />
    </p>
  </button>
</template>
