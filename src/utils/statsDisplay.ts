import { formatLapDuration } from '@/utils/time'

/** サマリ・ラップ統計で共通利用するラベル文言 */
export const STATS_LABELS = {
  totalElapsed: '合計時間',
  totalLapCount: '合計ラップ数',
  averageLap: '平均ラップ',
  fastestLap: '最速ラップ',
  slowestLap: '最遅ラップ',
  avgHourly: '平均時速',
  hourly: '時速',
  maxHourly: '最高時速',
  theoreticalHourly: '理論時速',
} as const

/** 概念ごとの文字色。両コンポーネントで同じ意味には同じ色を使う */
export const STATS_COLORS = {
  neutral: 'text-gray-900 dark:text-gray-100',
  fastest: 'text-emerald-600 dark:text-emerald-400',
  slowest: 'text-red-600 dark:text-red-400',
  hourly: 'text-indigo-600 dark:text-indigo-400',
  maxHourly: 'text-emerald-600 dark:text-emerald-400',
  theoretical: 'text-amber-600 dark:text-amber-400',
} as const

const nf = new Intl.NumberFormat('ja-JP')

/** ラップタイム。値が無ければプレースホルダ */
export function formatLapTime(ms: number | null): string {
  return ms !== null ? formatLapDuration(ms) : '--:--.--'
}

/** 周回数(単位「周」) */
export function formatLapCount(count: number | null): string {
  return count !== null ? `${nf.format(count)}周` : '--'
}

/** 周回数ベースの時速(単位「周/h」)。fractionDigits で小数桁を指定 */
export function formatLapSpeed(count: number, fractionDigits = 0): string {
  const value = fractionDigits === 0 ? Math.floor(count) : count
  return `${value.toLocaleString('ja-JP', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}周`
}

/**
 * 時速の主表示。ポイント設定時は「N pt/h」、未設定時は周回数で「N 周/h」。
 * lapFractionDigits は周回数表示の小数桁(平均時速は 1)。
 */
export function formatHourlySpeed(points: number | null, lapCount: number | null, lapFractionDigits = 0): string {
  if (points !== null) return `${nf.format(Math.round(points))}pt`
  if (lapCount !== null) return formatLapSpeed(lapCount, lapFractionDigits)
  return '--'
}

/** 平均時速の補足。ポイント表示時のみ、平均周回数(小数第1位)を併記 */
export function formatAvgHourlySub(points: number | null, lapCount: number | null): string {
  return points !== null && lapCount !== null ? `（${formatLapSpeed(lapCount, 1)}）` : ''
}

/** 最高時速の補足。ポイント表示時は周回数、記録回数があれば併記 */
export function formatMaxHourlySub(
  points: number | null,
  lapCount: number | null,
  recordCount: number | null = null,
): string {
  const parts: string[] = []
  if (points !== null && lapCount !== null) parts.push(formatLapSpeed(lapCount))
  if (recordCount !== null) parts.push(`${nf.format(recordCount)}回`)
  return parts.length ? `（${parts.join('・')}）` : ''
}

/** 理論時速の補足。「N周 + X秒相当」で端数を最速ラップ換算の残り時間として表す */
export function formatTheoreticalHourlySub(count: number | null, fastestLapMs: number | null): string {
  if (count === null || fastestLapMs === null) return ''
  const laps = Math.floor(count)
  const remainderSec = Math.round(((count - laps) * fastestLapMs) / 1000)
  return `（${formatLapCount(laps)} + ${nf.format(remainderSec)}秒）`
}
