<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LapRecord } from '@/types/lap'
import LapListItem from './LapListItem.vue'
import LapSplitDialog from './LapSplitDialog.vue'
import LapDeleteDialog from './LapDeleteDialog.vue'
import { useLapHistory } from '@/composables/useLapHistory'
import { useStats } from '@/composables/useStats'
import { useStopwatch } from '@/composables/useStopwatch'

const PAGE_SIZE = 200

const { laps, splitLap, deleteLap, deleteLapCompletely } = useLapHistory()
const { fastestSlowestLapIds } = useStats()
const { absorbIntoCurrentLap } = useStopwatch()

const reversedLaps = computed(() => laps.value.map((lap, index) => ({ lap, index })).reverse())

// ラップが数千件規模になってもDOM生成コストが膨れないよう、表示件数を段階的に増やす。
// データ自体(集計・CSV等)は全件保持したまま、画面に描画する行数だけを制限する。
const visibleCount = ref(PAGE_SIZE)

watch(
  () => laps.value.length,
  () => {
    visibleCount.value = PAGE_SIZE
  },
)

const displayedLaps = computed(() => reversedLaps.value.slice(0, visibleCount.value))
const hasMore = computed(() => reversedLaps.value.length > visibleCount.value)

function showMore(): void {
  visibleCount.value += PAGE_SIZE
}

const splitTarget = ref<LapRecord | null>(null)
const deleteTarget = ref<LapRecord | null>(null)

function onSplitConfirm(n: number): void {
  if (splitTarget.value) splitLap(splitTarget.value.id, n)
  splitTarget.value = null
}

function onMergeDelete(): void {
  const target = deleteTarget.value
  if (target) {
    // 末尾(最新)ラップの場合、「次」は現在進行中のラップなのでその時間に加算する
    const isLastLap = laps.value[laps.value.length - 1]?.id === target.id
    if (isLastLap) absorbIntoCurrentLap(target.lapDurationMs)
    deleteLap(target.id)
  }
  deleteTarget.value = null
}

function onTrueDelete(): void {
  if (deleteTarget.value) deleteLapCompletely(deleteTarget.value.id)
  deleteTarget.value = null
}
</script>

<template>
  <div class="flex flex-col">
    <p v-if="laps.length === 0" class="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
      まだラップがありません
    </p>
    <div v-else class="max-h-80 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1">
      <LapListItem
        v-for="entry in displayedLaps"
        :key="entry.lap.id"
        :lap="entry.lap"
        :index="entry.index"
        :is-fastest="entry.lap.id === fastestSlowestLapIds.fastestId"
        :is-slowest="entry.lap.id === fastestSlowestLapIds.slowestId"
        @split="splitTarget = $event"
        @delete="deleteTarget = $event"
      />
      <button
        v-if="hasMore"
        type="button"
        class="w-full py-2 text-center text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
        @click="showMore"
      >
        もっと見る(残り{{ reversedLaps.length - visibleCount }}件)
      </button>
    </div>

    <LapSplitDialog :lap="splitTarget" @close="splitTarget = null" @confirm="onSplitConfirm" />
    <LapDeleteDialog
      :lap="deleteTarget"
      @close="deleteTarget = null"
      @merge-delete="onMergeDelete"
      @true-delete="onTrueDelete"
    />
  </div>
</template>
