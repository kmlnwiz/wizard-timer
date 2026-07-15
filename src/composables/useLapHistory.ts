import { shallowRef, readonly, watch } from 'vue'
import type { LapRecord } from '@/types/lap'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { loadJson, saveJson } from './useLocalStorage'
import { getMostRecentFriday16 } from '@/utils/date'

function createSessionId(): string {
  return crypto.randomUUID()
}

// 配列は常に丸ごと差し替える(不変更新)運用のため shallowRef で十分。
// ref(deep)だと数千件規模でラップ1件ずつがreactiveプロキシ化され、フィルタ・集計のたびに
// プロキシ越しのプロパティアクセスが発生して著しく重くなるため避ける。
const laps = shallowRef<LapRecord[]>(loadJson<LapRecord[]>(STORAGE_KEYS.LAPS, []))
const currentSessionId = shallowRef<string>(createSessionId())

watch(laps, (value) => {
  saveJson(STORAGE_KEYS.LAPS, value)
})

export function useLapHistory() {
  /**
   * 新規ラップを追加する。elapsedMs はストップウォッチ開始からの累積経過時間。
   * lapDurationMs は直前ラップからの差分。
   */
  function addLap(elapsedMs: number): LapRecord {
    const previous = laps.value[laps.value.length - 1]
    const lapDurationMs = previous ? elapsedMs - previous.elapsedMs : elapsedMs

    const record: LapRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      elapsedMs,
      lapDurationMs,
      sessionId: currentSessionId.value,
    }
    laps.value = [...laps.value, record]
    return record
  }

  /** 対象ラップの lapDurationMs を N 等分し、N件のラップに置き換える */
  function splitLap(lapId: string, n: number): void {
    if (n < 2 || !Number.isInteger(n)) return
    const index = laps.value.findIndex((l) => l.id === lapId)
    if (index === -1) return

    const target = laps.value[index]
    const splitDuration = target.lapDurationMs / n
    const baseElapsed = target.elapsedMs - target.lapDurationMs
    const baseTimestamp = target.timestamp - target.lapDurationMs

    const newLaps: LapRecord[] = Array.from({ length: n }, (_, i) => ({
      id: crypto.randomUUID(),
      timestamp: Math.round(baseTimestamp + splitDuration * (i + 1)),
      elapsedMs: baseElapsed + splitDuration * (i + 1),
      lapDurationMs: splitDuration,
      sessionId: target.sessionId,
    }))

    laps.value = [...laps.value.slice(0, index), ...newLaps, ...laps.value.slice(index + 1)]
  }

  /**
   * 誤って記録したラップを削除する。後続ラップが存在する場合はその lapDurationMs に
   * 削除対象の時間を合算し、計測の連続性(経過時間・タイムスタンプ)を保つ。
   * 末尾ラップの場合は単純に削除する。
   */
  function deleteLap(lapId: string): void {
    const index = laps.value.findIndex((l) => l.id === lapId)
    if (index === -1) return

    const target = laps.value[index]
    const next = laps.value[index + 1]

    if (next) {
      const updatedNext: LapRecord = {
        ...next,
        lapDurationMs: next.lapDurationMs + target.lapDurationMs,
      }
      laps.value = [
        ...laps.value.slice(0, index),
        updatedNext,
        ...laps.value.slice(index + 2),
      ]
    } else {
      laps.value = laps.value.filter((l) => l.id !== lapId)
    }
  }

  /**
   * ラップを完全に削除する(次のラップへの時間合算を行わない)。
   * 休憩時間を誤ってラップとして記録してしまった場合など、その時間自体を
   * 記録から消し去りたいケースで使う。集計・CSVからも完全に除外される。
   */
  function deleteLapCompletely(lapId: string): void {
    laps.value = laps.value.filter((l) => l.id !== lapId)
  }

  /** 全履歴を消去し、新しい計測セッションを開始する */
  function reset(): void {
    laps.value = []
    currentSessionId.value = createSessionId()
  }

  /**
   * 開発確認用にダミーのラップ履歴を生成して読み込む(ローカル専用)。
   * 実際の「今」がイベント期間外(平日)でも72区分の実測グラフに正しく乗るよう、
   * 直近の金曜16:00を基準にした仮想イベント内の時刻でラップを生成する。
   * イベント開始(金曜16:00)から終了(月曜16:00)までの72時間分、全スロットを埋める。
   */
  function loadTestData(): void {
    const sessionId = createSessionId()
    const eventStart = getMostRecentFriday16(new Date())
    const endTimestamp = eventStart + 72 * 60 * 60 * 1000

    const generated: LapRecord[] = []
    let timestamp = eventStart
    let elapsedMs = 0
    while (timestamp < endTimestamp) {
      const lapDurationMs = Math.round((20 + Math.random() * 70) * 1000)
      elapsedMs += lapDurationMs
      timestamp += lapDurationMs
      generated.push({
        id: crypto.randomUUID(),
        timestamp,
        elapsedMs,
        lapDurationMs,
        sessionId,
      })
    }

    laps.value = generated
    currentSessionId.value = sessionId
  }

  return {
    laps: readonly(laps),
    addLap,
    splitLap,
    deleteLap,
    deleteLapCompletely,
    reset,
    loadTestData,
  }
}
