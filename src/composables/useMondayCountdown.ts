import { computed } from 'vue'
import { getNextMonday16 } from '@/utils/date'
import { formatDurationHHMMSScc } from '@/utils/time'
import { useClock } from './useClock'

export function useMondayCountdown() {
  const { nowMs } = useClock()

  const remainingMs = computed(() => {
    const target = getNextMonday16(new Date(nowMs.value))
    return Math.max(0, target - nowMs.value)
  })

  // 秒までの表示にする(末尾のセンチ秒 .cc を除去)
  const formatted = computed(() => formatDurationHHMMSScc(remainingMs.value).replace(/\.\d{2}$/, ''))

  return { remainingMs, formatted }
}
