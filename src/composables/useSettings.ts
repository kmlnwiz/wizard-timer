import { ref, readonly, watch } from 'vue'
import type { AppSettings } from '@/types/settings'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings'
import { loadJson, saveJson } from './useLocalStorage'

const settings = ref<AppSettings>({
  ...DEFAULT_SETTINGS,
  ...loadJson<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
})

watch(
  settings,
  (value) => {
    saveJson(STORAGE_KEYS.SETTINGS, value)
  },
  { deep: true },
)

export function useSettings() {
  function setLapKey(key: string): void {
    settings.value.lapKey = key
  }

  function setToggleKey(key: string): void {
    settings.value.toggleKey = key
  }

  function setStartFromZeroKey(key: string): void {
    settings.value.startFromZeroKey = key
  }

  function setDarkMode(mode: AppSettings['darkMode']): void {
    settings.value.darkMode = mode
  }

  function setPointsPerLap(points: number): void {
    settings.value.pointsPerLap = points
  }

  return {
    settings: readonly(settings),
    setLapKey,
    setToggleKey,
    setStartFromZeroKey,
    setDarkMode,
    setPointsPerLap,
  }
}
