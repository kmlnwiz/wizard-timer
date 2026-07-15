import { onMounted, onUnmounted } from 'vue'
import { useSettings } from './useSettings'

export interface KeyBindingHandlers {
  onLap: () => void
  onToggle: () => void
  onStartFromZero: () => void
}

export function useKeyBindings(handlers: KeyBindingHandlers) {
  const { settings } = useSettings()

  function handleKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

    if (settings.value.lapKey && e.key === settings.value.lapKey) {
      e.preventDefault()
      handlers.onLap()
    } else if (settings.value.toggleKey && e.key === settings.value.toggleKey) {
      e.preventDefault()
      handlers.onToggle()
    } else if (settings.value.startFromZeroKey && e.key === settings.value.startFromZeroKey) {
      e.preventDefault()
      handlers.onStartFromZero()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
}
