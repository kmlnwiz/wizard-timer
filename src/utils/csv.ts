import type { LapRecord } from '@/types/lap'

function escapeCsvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function lapsToCsv(laps: LapRecord[]): string {
  const header = ['id', 'timestamp_iso', 'elapsed_ms', 'lap_duration_ms', 'session_id']
  const rows = laps.map((l) => [
    l.id,
    new Date(l.timestamp).toISOString(),
    String(l.elapsedMs),
    String(l.lapDurationMs),
    l.sessionId,
  ])
  return [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\r\n')
}
