<script setup lang="ts">
import { useSettings } from '@/composables/useSettings'

const { settings, setPointsPerLap } = useSettings()

function onInput(e: Event): void {
  const value = Number((e.target as HTMLInputElement).value)
  setPointsPerLap(Number.isFinite(value) && value >= 0 ? value : 0)
}
</script>

<template>
  <div>
    <h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">ポイント設定</h3>
    <label class="flex items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
      1周あたりのポイント
      <input
        type="number"
        min="0"
        step="1"
        :value="settings.pointsPerLap || ''"
        placeholder="未設定"
        class="w-24 rounded-md border border-gray-300 px-2 py-1 text-right dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        @input="onInput"
      />
    </label>
  </div>
</template>
