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
