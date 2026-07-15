import type { LapRecord } from '@/types/lap'
import { lapsToCsv } from '@/utils/csv'
import { formatFileTimestamp } from '@/utils/time'

export function useCsvExport() {
  function downloadLapsCsv(laps: readonly LapRecord[]): void {
    const csv = lapsToCsv([...laps])
    const bom = '﻿'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wizard-timer_laps_${formatFileTimestamp(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { downloadLapsCsv }
}
