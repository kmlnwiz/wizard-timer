import { computed } from 'vue'
import { useLapHistory } from './useLapHistory'
import { useSettings } from './useSettings'
import { computeLapSlotCounts, computePointsPerHourStats } from '@/utils/lapSlots'

export interface SummaryResult {
  totalElapsedMs: number
  averageLapMs: number | null
  fastestLapMs: number | null
  slowestLapMs: number | null
  /** 各時間枠の実測周回数(切り捨て) × ポイント の最大値。ポイント未設定ならnull */
  maxPointsPerHour: number | null
  maxPointsPerHourLapCount: number | null
  /** 各時間枠の実測周回数(切り捨て) × ポイント の平均値。ポイント未設定ならnull */
  avgPointsPerHour: number | null
  avgPointsPerHourLapCount: number | null
}

export interface HourlyLapCount {
  hourLabel: string
  count: number
  /** 枠内の平均ラップタイム(ms)。0件はnull */
  avgLapMs: number | null
}

export function useSummary() {
  const { laps } = useLapHistory()
  const { settings } = useSettings()

  const lapSlots = computed(() => computeLapSlotCounts(laps.value))

  const hourlyLapCounts = computed<HourlyLapCount[]>(() =>
    lapSlots.value.map((slot) => ({ hourLabel: slot.label, count: slot.count, avgLapMs: slot.avgLapMs })),
  )

  const summary = computed<SummaryResult>(() => {
    const totalElapsedMs = laps.value.reduce((sum, l) => sum + l.lapDurationMs, 0)

    if (laps.value.length === 0) {
      return {
        totalElapsedMs,
        averageLapMs: null,
        fastestLapMs: null,
        slowestLapMs: null,
        maxPointsPerHour: null,
        maxPointsPerHourLapCount: null,
        avgPointsPerHour: null,
        avgPointsPerHourLapCount: null,
      }
    }

    const durations = laps.value.map((l) => l.lapDurationMs)
    const averageLapMs = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const fastestLapMs = Math.min(...durations)
    const slowestLapMs = Math.max(...durations)

    const pointsStats = computePointsPerHourStats(lapSlots.value, null, null, settings.value.pointsPerLap)

    return {
      totalElapsedMs,
      averageLapMs,
      fastestLapMs,
      slowestLapMs,
      maxPointsPerHour: pointsStats.maxPoints,
      maxPointsPerHourLapCount: pointsStats.maxLapCount,
      avgPointsPerHour: pointsStats.avgPoints,
      avgPointsPerHourLapCount: pointsStats.avgLapCount,
    }
  })

  return { summary, hourlyLapCounts }
}
