export interface StatsResult {
  rangeLabel: string
  averageLapMs: number | null
  fastestLapMs: number | null
  slowestLapMs: number | null
  /** 集計に使った期間(実測枠の開始〜終了epoch ms)。全期間の場合はnull */
  periodStartMs: number | null
  periodEndMs: number | null
  /** 期間内の実測枠ごとの「周回数(切り捨て)×ポイント」の最大値。ポイント未設定ならnull */
  maxPointsPerHour: number | null
  maxPointsPerHourLapCount: number | null
  /** 期間内の実測枠ごとの「周回数(切り捨て)×ポイント」の平均値。ポイント未設定ならnull */
  avgPointsPerHour: number | null
  avgPointsPerHourLapCount: number | null
}
