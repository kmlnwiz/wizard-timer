<script setup lang="ts">
import CurrentTimeDisplay from './CurrentTimeDisplay.vue'
import MondayCountdown from './MondayCountdown.vue'
</script>

<template>
  <div class="flex justify-around gap-4 border-b border-gray-100 py-3 dark:border-gray-800">
    <CurrentTimeDisplay />
    <MondayCountdown />
  </div>
</template>
