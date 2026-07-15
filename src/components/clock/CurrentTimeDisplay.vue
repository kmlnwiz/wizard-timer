<script setup lang="ts">
import { computed } from 'vue'
import { formatJstClock } from '@/utils/time'
import { useClock } from '@/composables/useClock'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const { nowMs } = useClock()
const clockText = computed(() => formatJstClock(new Date(nowMs.value)))
</script>

<template>
  <div class="text-center">
    <p class="text-xs text-gray-400 dark:text-gray-500">現在時刻(JST)</p>
    <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
      <TabularDigits :text="clockText" />
    </p>
  </div>
</template>
