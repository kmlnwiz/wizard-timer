<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StopwatchDisplay from '@/components/stopwatch/StopwatchDisplay.vue'
import StopwatchControls from '@/components/stopwatch/StopwatchControls.vue'
import LapButtons from '@/components/stopwatch/LapButtons.vue'
import LapList from '@/components/laps/LapList.vue'
import StatsPanel from '@/components/stats/StatsPanel.vue'
import SummaryPanel from '@/components/stats/SummaryPanel.vue'
import ClockPanel from '@/components/clock/ClockPanel.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import { useStopwatch } from '@/composables/useStopwatch'
import { useKeyBindings } from '@/composables/useKeyBindings'

const { isRunning, currentLapElapsedMs, canLap, toggle, resetElapsed, startFromZero, recordLap } = useStopwatch()

useKeyBindings({
  onLap: () => recordLap(),
  onToggle: () => toggle(),
  onStartFromZero: () => startFromZero(),
})

const settingsOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <AppHeader @open-settings="settingsOpen = true" />

    <AppLayout>
      <template #primary>
        <div class="space-y-4 border-b border-gray-100 pb-4 dark:border-gray-800">
          <StopwatchDisplay :current-lap-elapsed-ms="currentLapElapsedMs" :is-running="isRunning" />
          <StopwatchControls
            :is-running="isRunning"
            @toggle="toggle"
            @reset-elapsed="resetElapsed"
            @start-from-zero="startFromZero"
          />
          <LapButtons :can-lap="canLap" @lap="recordLap" />
        </div>

        <ClockPanel />

        <LapList />
      </template>

      <template #secondary>
        <StatsPanel />
        <div class="mt-4">
          <SummaryPanel />
        </div>
      </template>
    </AppLayout>

    <SettingsPanel :open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>
