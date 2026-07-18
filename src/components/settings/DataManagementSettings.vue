<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useLapHistory } from '@/composables/useLapHistory'
import { useCsvExport } from '@/composables/useCsvExport'

const { laps, reset, loadTestData } = useLapHistory()
const { downloadLapsCsv } = useCsvExport()
const isDev = import.meta.env.DEV

const confirmOpen = ref(false)

function confirmReset(): void {
  reset()
  confirmOpen.value = false
}
</script>

<template>
  <div>
    <h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">データ管理</h3>
    <div class="flex flex-wrap gap-2">
      <BaseButton variant="secondary" @click="downloadLapsCsv(laps)">CSVダウンロード</BaseButton>
      <BaseButton variant="danger" @click="confirmOpen = true">全履歴リセット</BaseButton>
      <BaseButton v-if="isDev" variant="ghost" @click="loadTestData">テストデータ読み込み(開発用)</BaseButton>
    </div>

    <BaseModal :open="confirmOpen" title="全履歴をリセットしますか？" @close="confirmOpen = false">
      <p class="mb-3 text-sm text-gray-600 dark:text-gray-300">
        記録済みの全ラップ(オール集計を含む)が削除されます。この操作は取り消せません。
      </p>
      <div class="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        <p class="mb-2">
          リセット前に、記録をCSVファイルとして保存しておくことをおすすめします。
        </p>
        <BaseButton variant="secondary" @click="downloadLapsCsv(laps)">CSVで保存する</BaseButton>
      </div>
      <div class="flex justify-end gap-2">
        <BaseButton variant="ghost" @click="confirmOpen = false">キャンセル</BaseButton>
        <BaseButton variant="danger" @click="confirmReset">リセットする</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
