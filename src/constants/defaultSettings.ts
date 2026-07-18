import type { AppSettings } from '@/types/settings'

export const DEFAULT_SETTINGS: AppSettings = {
  lapKey: ' ',
  toggleKey: '',
  startFromZeroKey: '',
  darkMode: 'system',
  pointsPerLap: 0,
}

/** ラップ確定操作の連打防止クールダウン(ms) */
export const LAP_COOLDOWN_MS = 3000

/** 集計区分(1時間は固定、それ以外はこの配列 + オール) */
export const STATS_RANGE_HOURS = [3] as const
