<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { LapRecord } from '@/types/lap'

const props = defineProps<{ lap: LapRecord | null }>()
const emit = defineEmits<{ close: []; confirm: [n: number] }>()

const splitCount = ref(2)

watch(
  () => props.lap,
  () => {
    splitCount.value = 2
  },
)
</script>

<template>
  <BaseModal :open="lap !== null" title="ラップを分割" @close="emit('close')">
    <p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
      複数周分をまとめて記録してしまったラップを、均等な時間でN件に分割します。
    </p>
    <label class="mb-4 block text-sm text-gray-700 dark:text-gray-200">
      分割数
      <input
        v-model.number="splitCount"
        type="number"
        min="2"
        step="1"
        class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      />
    </label>
    <div class="flex justify-end gap-2">
      <BaseButton variant="ghost" @click="emit('close')">キャンセル</BaseButton>
      <BaseButton variant="primary" :disabled="splitCount < 2" @click="emit('confirm', splitCount)">
        分割する
      </BaseButton>
    </div>
  </BaseModal>
</template>
