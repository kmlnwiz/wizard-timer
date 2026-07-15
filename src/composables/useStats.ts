import { computed } from 'vue'
import type { LapRecord } from '@/types/lap'
import type { StatsResult } from '@/types/stats'
import { STATS_RANGE_HOURS } from '@/constants/defaultSettings'
import { getCurrentClock55SlotStart } from '@/utils/date'
import { computeLapSlotCounts, computePointsPerHourStats, type LapSlotCount } from '@/utils/lapSlots'
import { useClock } from './useClock'
import { useLapHistory } from './useLapHistory'
import { useSettings } from './useSettings'

const HOUR_MS = 60 * 60 * 1000

/**
 * NN:55〜次の55分までの実測枠を基準に、直近N時間分(=現在の枠を含めたN枠)を切り出す。
 * 「今から何時間前」の連続的な巻き戻しではなく、実際の枠境界に揃えた実測値を対象にする。
 */
function filterLapsInRange(laps: readonly LapRecord[], hours: number | 'all', now: number): LapRecord[] {
  if (hours === 'all') return [...laps]
  const currentSlotStart = getCurrentClock55SlotStart(now)
  const thresholdMs = currentSlotStart - (hours - 1) * HOUR_MS
  return laps.filter((l) => l.timestamp >= thresholdMs && l.timestamp <= now)
}

function computeStats(
  laps: readonly LapRecord[],
  slots: readonly LapSlotCount[],
  hours: number | 'all',
  now: number,
  pointsPerLap: number,
): StatsResult {
  const inRange = filterLapsInRange(laps, hours, now)

  const averageLapMs = inRange.length
    ? inRange.reduce((sum, l) => sum + l.lapDurationMs, 0) / inRange.length
    : null
  const fastestLapMs = inRange.length ? Math.min(...inRange.map((l) => l.lapDurationMs)) : null
  const slowestLapMs = inRange.length ? Math.max(...inRange.map((l) => l.lapDurationMs)) : null

  const currentSlotStart = getCurrentClock55SlotStart(now)
  const periodStartMs = hours === 'all' ? null : currentSlotStart - (hours - 1) * HOUR_MS
  // 終端は現在時刻ではなく、現在の実測枠の終点(例: 21:55開始なら22:55)で固定表示する
  const periodEndMs = hours === 'all' ? null : currentSlotStart + HOUR_MS

  const pointsStats = computePointsPerHourStats(slots, periodStartMs, periodEndMs, pointsPerLap)

  return {
    rangeLabel: hours === 'all' ? '全期間' : `直近${hours}時間`,
    averageLapMs,
    fastestLapMs,
    slowestLapMs,
    periodStartMs,
    periodEndMs,
    maxPointsPerHour: pointsStats.maxPoints,
    maxPointsPerHourLapCount: pointsStats.maxLapCount,
    avgPointsPerHour: pointsStats.avgPoints,
    avgPointsPerHourLapCount: pointsStats.avgLapCount,
  }
}

export function useStats() {
  const { nowMs } = useClock()
  const { laps } = useLapHistory()
  const { settings } = useSettings()

  // 集計に必要な精度は秒単位で十分なため、50ms tickそのままだと無駄な再計算が増える。
  // 値が実際に変わったときだけ依存側が再評価されるVueのcomputedの性質を利用して間引く。
  const secondNow = computed(() => Math.floor(nowMs.value / 1000) * 1000)

  // ラップ件数が多くてもO(N)で済むよう、スロット集計はlapsが変化したときだけ計算する
  const lapSlots = computed(() => computeLapSlotCounts(laps.value))

  const statsList = computed<StatsResult[]>(() => {
    const ranges: (number | 'all')[] = [1, ...STATS_RANGE_HOURS, 'all']
    return ranges.map((h) => computeStats(laps.value, lapSlots.value, h, secondNow.value, settings.value.pointsPerLap))
  })

  /** 最速・最遅の lapId を返す(強調表示用) */
  const fastestSlowestLapIds = computed<{ fastestId: string | null; slowestId: string | null }>(() => {
    if (laps.value.length < 2) return { fastestId: null, slowestId: null }

    let fastest = laps.value[0]
    let slowest = laps.value[0]
    for (const lap of laps.value) {
      if (lap.lapDurationMs < fastest.lapDurationMs) fastest = lap
      if (lap.lapDurationMs > slowest.lapDurationMs) slowest = lap
    }
    return { fastestId: fastest.id, slowestId: slowest.id }
  })

  return { statsList, fastestSlowestLapIds }
}
