<script setup lang="ts">
import { useMondayCountdown } from '@/composables/useMondayCountdown'
import TabularDigits from '@/components/ui/TabularDigits.vue'

const { formatted } = useMondayCountdown()
</script>

<template>
  <div class="text-center">
    <p class="text-xs text-gray-400 dark:text-gray-500">次の月曜16:00まで</p>
    <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
      <TabularDigits :text="formatted" />
    </p>
  </div>
</template>
