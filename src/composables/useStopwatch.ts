import { ref, computed, readonly } from 'vue'
import { LAP_COOLDOWN_MS } from '@/constants/defaultSettings'
import { useLapHistory } from './useLapHistory'

const TICK_MS = 50

const isRunning = ref(false)
const elapsedMs = ref(0)
const lastLapAt = ref<number | null>(null)
/** 現在進行中のラップの起点となる elapsedMs 値。current-lap-elapsed = elapsedMs - lapBaselineMs */
const lapBaselineMs = ref(0)

let startedAt = 0
let intervalId: ReturnType<typeof setInterval> | null = null

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

export function useStopwatch() {
  const { addLap } = useLapHistory()

  function start(): void {
    if (isRunning.value) return
    startedAt = Date.now() - elapsedMs.value
    isRunning.value = true
    startInterval()
  }

  /** iPhoneのストップウォッチの「停止」と同じ挙動。経過時間を保持したまま計測を止める */
  function pause(): void {
    if (!isRunning.value) return
    tick()
    stopInterval()
    isRunning.value = false
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
  }

  /** 経過時間・現在ラップともに0にリセットしてから計測を開始する */
  function startFromZero(): void {
    elapsedMs.value = 0
    lapBaselineMs.value = 0
    startedAt = Date.now()
    isRunning.value = true
    startInterval()
  }

  /**
   * 末尾ラップを「次(=現在進行中のラップ)に合算」した際に呼ぶ。
   * 現在進行中のラップの起点を過去にずらすことで、削除した分の時間を加算する。
   */
  function absorbIntoCurrentLap(ms: number): void {
    lapBaselineMs.value -= ms
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
