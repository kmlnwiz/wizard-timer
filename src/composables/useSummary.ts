import { computed } from 'vue'
import { useLapHistory } from './useLapHistory'
import { useSettings } from './useSettings'
import { computeLapSlotCounts, computePointsPerHourStats } from '@/utils/lapSlots'

const HOUR_MS = 60 * 60 * 1000

export interface SummaryResult {
  totalElapsedMs: number
  /** 記録した総ラップ数 */
  totalLapCount: number
  averageLapMs: number | null
  fastestLapMs: number | null
  slowestLapMs: number | null
  /** 各時間枠の実測周回数(切り捨て) × ポイント の最大値。ポイント未設定ならnull */
  maxPointsPerHour: number | null
  maxPointsPerHourLapCount: number | null
  /** 最高時速を記録した枠の数(記録回数)。ラップが無ければnull */
  maxPointsPerHourRecordCount: number | null
  /** 各時間枠の実測周回数(切り捨て) × ポイント の平均値。ポイント未設定ならnull */
  avgPointsPerHour: number | null
  avgPointsPerHourLapCount: number | null
  /** 最速ラップのペースで1時間回り続けた場合の周回数(小数)。ラップが無ければnull */
  theoreticalLapCount: number | null
  /** 理論周回数(切り捨て) × ポイント。ポイント未設定ならnull */
  theoreticalPointsPerHour: number | null
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
        totalLapCount: 0,
        averageLapMs: null,
        fastestLapMs: null,
        slowestLapMs: null,
        maxPointsPerHour: null,
        maxPointsPerHourLapCount: null,
        maxPointsPerHourRecordCount: null,
        avgPointsPerHour: null,
        avgPointsPerHourLapCount: null,
        theoreticalLapCount: null,
        theoreticalPointsPerHour: null,
      }
    }

    // 大配列でのスプレッド(Math.min(...))を避け、1回の走査で平均・最速・最遅を求める
    let sum = 0
    let fastestLapMs = Infinity
    let slowestLapMs = -Infinity
    for (const l of laps.value) {
      sum += l.lapDurationMs
      if (l.lapDurationMs < fastestLapMs) fastestLapMs = l.lapDurationMs
      if (l.lapDurationMs > slowestLapMs) slowestLapMs = l.lapDurationMs
    }
    const averageLapMs = sum / laps.value.length

    const pointsStats = computePointsPerHourStats(lapSlots.value, null, null, settings.value.pointsPerLap)

    const pointsPerLap = settings.value.pointsPerLap
    const theoreticalLapCount = fastestLapMs > 0 ? HOUR_MS / fastestLapMs : null
    const theoreticalPointsPerHour =
      theoreticalLapCount !== null && pointsPerLap > 0 ? Math.floor(theoreticalLapCount) * pointsPerLap : null

    return {
      totalElapsedMs,
      totalLapCount: laps.value.length,
      averageLapMs,
      fastestLapMs,
      slowestLapMs,
      maxPointsPerHour: pointsStats.maxPoints,
      maxPointsPerHourLapCount: pointsStats.maxLapCount,
      maxPointsPerHourRecordCount: pointsStats.maxRecordCount,
      avgPointsPerHour: pointsStats.avgPoints,
      avgPointsPerHourLapCount: pointsStats.avgLapCount,
      theoreticalLapCount,
      theoreticalPointsPerHour,
    }
  })

  return { summary, hourlyLapCounts }
}
