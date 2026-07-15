<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { LapRecord } from '@/types/lap'

defineProps<{ lap: LapRecord | null }>()
const emit = defineEmits<{ close: []; mergeDelete: []; trueDelete: [] }>()
</script>

<template>
  <BaseModal :open="lap !== null" title="ラップを削除" @close="emit('close')">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">削除方法を選んでください。</p>
    <div class="mb-4 space-y-3">
      <button
        type="button"
        class="w-full rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        @click="emit('mergeDelete')"
      >
        <p class="font-medium text-gray-900 dark:text-gray-100">次のラップに合算して削除</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          押し間違いなどで誤って早くラップしてしまった場合。この時間を次のラップに繰り込み、計測を継続扱いにします。
        </p>
      </button>
      <button
        type="button"
        class="w-full rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        @click="emit('trueDelete')"
      >
        <p class="font-medium text-gray-900 dark:text-gray-100">完全に削除</p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          休憩時間を誤って記録した場合など。合算せずこの時間ごと記録から取り除きます。
        </p>
      </button>
    </div>
    <div class="flex justify-end">
      <BaseButton variant="ghost" @click="emit('close')">キャンセル</BaseButton>
    </div>
  </BaseModal>
</template>
