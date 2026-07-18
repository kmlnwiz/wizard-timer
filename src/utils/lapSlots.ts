import type { LapRecord } from '@/types/lap'
import { getCurrentEventStart, getEventHourSlots } from './date'

export interface LapSlotCount {
  startMs: number
  endMs: number
  label: string
  count: number
  /** 枠内ラップの平均ラップタイム(ms)。0件はnull */
  avgLapMs: number | null
}

const HOUR_MS = 60 * 60 * 1000

/**
 * イベント(金曜16:00〜月曜16:00)のNN:55〜次の55分までの実測枠ごとに、
 * ラップ件数・平均ラップタイムを集計する。ラップの有無に関わらず常に72枠分を返す。
 * イベント開始は最新ラップの時刻から逆算する(ラップが無い場合は現在時刻を基準にする)。
 * ラップ件数が多くても O(N) で終わるよう、枠ごとにfilterするのではなく1回の走査で集計する。
 */
export function computeLapSlotCounts(laps: readonly LapRecord[], now: number = Date.now()): LapSlotCount[] {
  const anchorTimestamp = laps.length > 0 ? laps[laps.length - 1].timestamp : now
  const eventStart = getCurrentEventStart(new Date(anchorTimestamp))
  const slots = getEventHourSlots(eventStart)

  const counts = new Array<number>(slots.length).fill(0)
  const sums = new Array<number>(slots.length).fill(0)
  const firstBoundary = slots[0].endMs

  for (const lap of laps) {
    if (lap.timestamp < eventStart) continue
    let index: number
    if (lap.timestamp < firstBoundary) {
      index = 0
    } else {
      index = 1 + Math.floor((lap.timestamp - firstBoundary) / HOUR_MS)
    }
    if (index < 0 || index >= slots.length) continue
    counts[index] += 1
    sums[index] += lap.lapDurationMs
  }

  return slots.map((slot, i) => ({
    ...slot,
    count: counts[i],
    avgLapMs: counts[i] > 0 ? sums[i] / counts[i] : null,
  }))
}

export interface PointsPerHourStats {
  maxPoints: number | null
  maxLapCount: number | null
  /** 最高周回数を記録した枠の数(=最高時速の記録回数) */
  maxRecordCount: number | null
  avgPoints: number | null
  avgLapCount: number | null
}

/**
 * 実測枠(1枠=1時間相当)ごとの「周回数(=時速)」から、期間内での最高値・平均値を算出する。
 * 周回数は常に返し、ポイント換算値(周回数×ポイント)はポイント設定時のみ返す。
 * 周回数とポイントは比例するため、最高枠は周回数で選んでポイントに換算する。
 */
export function computePointsPerHourStats(
  slots: readonly LapSlotCount[],
  periodStartMs: number | null,
  periodEndMs: number | null,
  pointsPerLap: number,
): PointsPerHourStats {
  const relevant = (
    periodStartMs === null
      ? slots
      : slots.filter((s) => s.startMs >= periodStartMs && s.startMs < (periodEndMs ?? Infinity))
  ).filter((s) => s.count > 0)

  if (relevant.length === 0)
    return { maxPoints: null, maxLapCount: null, maxRecordCount: null, avgPoints: null, avgLapCount: null }

  const maxLapCount = relevant.reduce((max, s) => (s.count > max ? s.count : max), relevant[0].count)
  const maxRecordCount = relevant.filter((s) => s.count === maxLapCount).length
  const avgLapCount = relevant.reduce((sum, s) => sum + s.count, 0) / relevant.length
  const hasPoints = pointsPerLap > 0

  return {
    maxPoints: hasPoints ? Math.floor(maxLapCount) * pointsPerLap : null,
    maxLapCount,
    maxRecordCount,
    avgPoints: hasPoints ? avgLapCount * pointsPerLap : null,
    avgLapCount,
  }
}
