import { ref, readonly, onMounted, onUnmounted } from 'vue'

const nowMs = ref(Date.now())
let refCount = 0
let intervalId: ReturnType<typeof setInterval> | null = null

function tick(): void {
  nowMs.value = Date.now()
}

/** JST1/100秒単位の現在時刻を更新するcomposable。複数箇所から呼ばれてもタイマーは1つに集約される */
export function useClock() {
  onMounted(() => {
    refCount += 1
    if (intervalId === null) {
      tick()
      intervalId = setInterval(tick, 50)
    }
  })

  onUnmounted(() => {
    refCount -= 1
    if (refCount <= 0 && intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  })

  return { nowMs: readonly(nowMs) }
}
