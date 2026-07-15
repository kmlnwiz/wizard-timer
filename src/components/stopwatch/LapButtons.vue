<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '@/composables/useSettings'

defineProps<{ canLap: boolean }>()
const emit = defineEmits<{ lap: [] }>()

const { settings } = useSettings()
const keyLabel = computed(() => (settings.value.lapKey === ' ' ? 'スペース' : settings.value.lapKey))
</script>

<template>
  <button
    type="button"
    :disabled="!canLap"
    class="w-full rounded-md bg-indigo-600 py-5 text-xl font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:disabled:bg-indigo-900"
    @click="emit('lap')"
  >
    ラップ<span class="ml-2 text-sm font-normal opacity-80">({{ keyLabel }})</span>
  </button>
</template>
