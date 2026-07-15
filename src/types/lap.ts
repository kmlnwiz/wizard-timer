export interface LapRecord {
  id: string
  /** ラップ記録時のUnix epoch ms。直近N時間フィルタの基準になる */
  timestamp: number
  /** ストップウォッチ開始からの累積経過時間 */
  elapsedMs: number
  /** 直前ラップからの差分(実質のラップタイム) */
  lapDurationMs: number
  /** リセットするまでの一連の計測をグルーピングするID */
  sessionId: string
}
