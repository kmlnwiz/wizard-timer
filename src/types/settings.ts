export type DarkModeSetting = 'system' | 'light' | 'dark'

export interface AppSettings {
  lapKey: string
  /** 開始/停止トグルのキー。空文字は未設定 */
  toggleKey: string
  /** 0秒から開始のキー。空文字は未設定 */
  startFromZeroKey: string
  darkMode: DarkModeSetting
  /** 1周あたりのポイント。0は未設定扱い */
  pointsPerLap: number
}
