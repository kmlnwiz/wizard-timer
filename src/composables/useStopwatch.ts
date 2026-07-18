import { ref, computed, readonly } from 'vue'
import { LAP_COOLDOWN_MS } from '@/constants/defaultSettings'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { loadJson, saveJson } from './useLocalStorage'
import { useLapHistory } from './useLapHistory'

const TICK_MS = 50

/** リロードをまたいで計測を継続するために保存する状態 */
interface StopwatchPersisted {
  isRunning: boolean
  /** 計測開始の絶対時刻(epoch ms)。running時のみ意味を持つ */
  startedAt: number
  /** 停止中に保持している経過時間(ms) */
  elapsedMs: number
  lapBaselineMs: number
}

const isRunning = ref(false)
const elapsedMs = ref(0)
const lastLapAt = ref<number | null>(null)
/** 現在進行中のラップの起点となる elapsedMs 値。current-lap-elapsed = elapsedMs - lapBaselineMs */
const lapBaselineMs = ref(0)

let startedAt = 0
let intervalId: ReturnType<typeof setInterval> | null = null

function persist(): void {
  const state: StopwatchPersisted = {
    isRunning: isRunning.value,
    startedAt,
    elapsedMs: elapsedMs.value,
    lapBaselineMs: lapBaselineMs.value,
  }
  saveJson(STORAGE_KEYS.STOPWATCH, state)
}

function tick(): void {
  elapsedMs.value = Date.now() - startedAt
}

function startInterval(): void {
  if (intervalId !== null) return
  intervalId = setInterval(tick, TICK_MS)
}

function stopInterval(): void {
  if (intervalId === null) return
  clearInterval(intervalId)
  intervalId = null
}

// モジュール初期化時に保存済みの状態を復元する。
// 計測中だった場合は、保存した絶対開始時刻から現在までの経過を再計算して継続する。
;(function restore(): void {
  const saved = loadJson<StopwatchPersisted | null>(STORAGE_KEYS.STOPWATCH, null)
  if (!saved) return
  lapBaselineMs.value = saved.lapBaselineMs
  if (saved.isRunning) {
    startedAt = saved.startedAt
    elapsedMs.value = Date.now() - startedAt
    isRunning.value = true
    startInterval()
  } else {
    elapsedMs.value = saved.elapsedMs
  }
})()

export function useStopwatch() {
  const { addLap, startNewSession } = useLapHistory()

  function start(): void {
    if (isRunning.value) return
    startedAt = Date.now() - elapsedMs.value
    isRunning.value = true
    startInterval()
    persist()
  }

  /** iPhoneのストップウォッチの「停止」と同じ挙動。経過時間を保持したまま計測を止める */
  function pause(): void {
    if (!isRunning.value) return
    tick()
    stopInterval()
    isRunning.value = false
    persist()
  }

  function toggle(): void {
    if (isRunning.value) pause()
    else start()
  }

  /**
   * 現在進行中のラップの表示だけを0秒に戻す(絶対経過時間はそのまま継続させる)。
   * 絶対経過時間を巻き戻すと、既に記録済みのラップとの差分計算が壊れるため触らない。
   */
  function resetElapsed(): void {
    if (isRunning.value) tick()
    lapBaselineMs.value = elapsedMs.value
    persist()
  }

  /** 経過時間・現在ラップともに0にリセットしてから計測を開始する */
  function startFromZero(): void {
    elapsedMs.value = 0
    lapBaselineMs.value = 0
    lastLapAt.value = null
    startNewSession()
    startedAt = Date.now()
    isRunning.value = true
    startInterval()
    persist()
  }

  /**
   * 末尾ラップを「次(=現在進行中のラップ)に合算」した際に呼ぶ。
   * 現在進行中のラップの起点を過去にずらすことで、削除した分の時間を加算する。
   */
  function absorbIntoCurrentLap(ms: number): void {
    lapBaselineMs.value -= ms
    persist()
  }

  const canLap = computed(() => {
    if (!isRunning.value) return false
    if (lastLapAt.value === null) return true
    // elapsedMs.value を参照することで、50ms tick のたびにクールダウン経過を再評価する
    void elapsedMs.value
    return Date.now() - lastLapAt.value >= LAP_COOLDOWN_MS
  })

  /** ラップを記録する。3秒クールダウン中の連打は無視する */
  function recordLap(): void {
    if (!canLap.value) return
    addLap(elapsedMs.value)
    lapBaselineMs.value = elapsedMs.value
    lastLapAt.value = Date.now()
    persist()
  }

  const currentLapElapsedMs = computed(() => elapsedMs.value - lapBaselineMs.value)

  return {
    isRunning: readonly(isRunning),
    elapsedMs: readonly(elapsedMs),
    currentLapElapsedMs,
    canLap,
    start,
    pause,
    toggle,
    resetElapsed,
    startFromZero,
    absorbIntoCurrentLap,
    recordLap,
  }
}
