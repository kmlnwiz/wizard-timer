import { computed } from 'vue'
import { getNextMonday16 } from '@/utils/date'
import { formatDurationHHHMMSScc } from '@/utils/time'
import { useClock } from './useClock'

export function useMondayCountdown() {
  const { nowMs } = useClock()

  const remainingMs = computed(() => {
    const target = getNextMonday16(new Date(nowMs.value))
    return Math.max(0, target - nowMs.value)
  })

  const formatted = computed(() => formatDurationHHHMMSScc(remainingMs.value))

  return { remainingMs, formatted }
}
