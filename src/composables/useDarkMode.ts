import { ref, watch, onMounted } from 'vue'
import type { DarkModeSetting } from '@/types/settings'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { loadJson, saveJson } from './useLocalStorage'

const mode = ref<DarkModeSetting>(loadJson<DarkModeSetting>(STORAGE_KEYS.DARK_MODE, 'system'))
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

function apply(): void {
  const isDark = mode.value === 'dark' || (mode.value === 'system' && prefersDark.matches)
  document.documentElement.classList.toggle('dark', isDark)
}

watch(mode, () => {
  saveJson(STORAGE_KEYS.DARK_MODE, mode.value)
  apply()
})

let listenerAttached = false

export function useDarkMode() {
  onMounted(() => {
    if (!listenerAttached) {
      prefersDark.addEventListener('change', apply)
      listenerAttached = true
    }
    apply()
  })

  function setMode(next: DarkModeSetting): void {
    mode.value = next
  }

  function toggle(): void {
    mode.value = mode.value === 'dark' ? 'light' : mode.value === 'light' ? 'system' : 'dark'
  }

  return { mode, setMode, toggle }
}
