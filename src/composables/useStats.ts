import { computed } from 'vue'
import type { LapRecord } from '@/types/lap'
import type { StatsResult } from '@/types/stats'
import { getCurrentClock55SlotStart } from '@/utils/date'
import { computeLapSlotCounts, computePointsPerHourStats, type LapSlotCount } from '@/utils/lapSlots'
import { useClock } from './useClock'
import { useLapHistory } from './useLapHistory'
import { useSettings } from './useSettings'

const HOUR_MS = 60 * 60 * 1000

/** 集計区分の仕様。offsetHours は現在枠から何枠さかのぼった位置を終端にするか */
interface RangeSpec {
  label: string
  hours: number | 'all'
  offsetHours: number
  showMaxHourly: boolean
}

const RANGE_SPECS: readonly RangeSpec[] = [
  { label: '直近1時間', hours: 1, offsetHours: 0, showMaxHourly: false },
  { label: '前の1時間', hours: 1, offsetHours: 1, showMaxHourly: false },
  { label: '全体統計', hours: 'all', offsetHours: 0, showMaxHourly: true },
]

/**
 * NN:55〜次の55分までの実測枠を基準に、指定枠数分を切り出す。
 * offsetHours で終端を過去方向にずらせる(前の1時間 = offsetHours:1)。
 * 「今から何時間前」の連続的な巻き戻しではなく、実際の枠境界に揃えた実測値を対象にする。
 */
function getPeriodBounds(hours: number, offsetHours: number, now: number): { startMs: number; endMs: number } {
  const currentSlotStart = getCurrentClock55SlotStart(now)
  const endMs = currentSlotStart + HOUR_MS - offsetHours * HOUR_MS
  const startMs = endMs - hours * HOUR_MS
  return { startMs, endMs }
}

function computeStats(
  laps: readonly LapRecord[],
  slots: readonly LapSlotCount[],
  spec: RangeSpec,
  now: number,
  pointsPerLap: number,
): StatsResult {
  const bounds = spec.hours === 'all' ? null : getPeriodBounds(spec.hours, spec.offsetHours, now)
  const inRange = bounds === null ? [...laps] : laps.filter((l) => l.timestamp >= bounds.startMs && l.timestamp < bounds.endMs)

  // ラップが数千件規模でも重くならないよう、平均・最速・最遅を1回の走査で求める。
  // Math.min(...array) のスプレッドは大配列で低速・スタック溢れの恐れがあるため使わない。
  let averageLapMs: number | null = null
  let fastestLapMs: number | null = null
  let slowestLapMs: number | null = null
  if (inRange.length) {
    let sum = 0
    let min = Infinity
    let max = -Infinity
    for (const l of inRange) {
      sum += l.lapDurationMs
      if (l.lapDurationMs < min) min = l.lapDurationMs
      if (l.lapDurationMs > max) max = l.lapDurationMs
    }
    averageLapMs = sum / inRange.length
    fastestLapMs = min
    slowestLapMs = max
  }

  // 終端は現在時刻ではなく実測枠の終点(例: 21:55開始なら22:55)で固定表示する
  const periodStartMs = bounds === null ? null : bounds.startMs
  const periodEndMs = bounds === null ? null : bounds.endMs

  const pointsStats = computePointsPerHourStats(slots, periodStartMs, periodEndMs, pointsPerLap)

  return {
    rangeLabel: spec.label,
    showMaxHourly: spec.showMaxHourly,
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

  const statsList = computed<StatsResult[]>(() =>
    RANGE_SPECS.map((spec) => computeStats(laps.value, lapSlots.value, spec, secondNow.value, settings.value.pointsPerLap)),
  )

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
