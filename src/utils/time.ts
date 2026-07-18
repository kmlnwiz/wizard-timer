/** ms を H:MM:SS.cc 形式(1/100秒まで)に整形する */
export function formatStopwatch(ms: number): string {
  const totalCentiSeconds = Math.floor(ms / 10)
  const centiSeconds = totalCentiSeconds % 100
  const totalSeconds = Math.floor(ms / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  const pad = (n: number) => String(n).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centiSeconds)}`
  }
  return `${minutes}:${pad(seconds)}.${pad(centiSeconds)}`
}

/** ms を M:SS.cc 形式(ラップ一覧・平均ラップ・最速最遅表示用、1/100秒まで)に整形する */
export function formatLapDuration(ms: number): string {
  const totalCentiSeconds = Math.round(ms / 10)
  const centiSeconds = totalCentiSeconds % 100
  const totalSeconds = Math.floor(totalCentiSeconds / 100)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${minutes}:${pad(seconds)}.${pad(centiSeconds)}`
}

/** ms を「N.N時間」形式(ラップ合計時間の表示用)に整形する */
export function formatHours(ms: number): string {
  return `${(ms / (60 * 60 * 1000)).toFixed(1)}時間`
}

/** ms を D日 HH:MM:SS 形式(カウントダウン表示用)に整形する */
export function formatDurationDHMS(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  const pad = (n: number) => String(n).padStart(2, '0')
  const hms = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return days > 0 ? `${days}日 ${hms}` : hms
}

/** ms を HH:MM:SS.cc 形式(2桁時間・1/100秒まで)に整形する */
export function formatDurationHHHMMSScc(ms: number): string {
  const totalCentiSeconds = Math.floor(ms / 10)
  const centiSeconds = totalCentiSeconds % 100
  const totalSeconds = Math.floor(totalCentiSeconds / 100)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const hours = Math.floor(totalMinutes / 60)

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${String(hours).padStart(2, '0')}:${pad(minutes)}:${pad(seconds)}.${pad(centiSeconds)}`
}

interface JstParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  /** 0=日, 1=月, ... 6=土 */
  weekday: number
}

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const jstFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'short',
  hour12: false,
})

/** 指定日時のJST上での年月日・時分秒・曜日を取得する */
export function getJstParts(date: Date): JstParts {
  const parts = Object.fromEntries(jstFormatter.formatToParts(date).map((p) => [p.type, p.value]))
  // hour: '2-digit', hour12: false の場合、深夜0時が "24" になる実装差異があるため 24 を 0 に補正
  const hour = Number(parts.hour) % 24
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAY_MAP[parts.weekday] ?? 0,
  }
}

/** JSTの現在時刻を HH:MM:SS.cc 形式(1/100秒まで)で返す */
export function formatJstClock(date: Date): string {
  const { hour, minute, second } = getJstParts(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  // ミリ秒未満の内訳はタイムゾーンに依存しないため、そのままcentisecondsに変換できる
  const centiSeconds = Math.floor((date.getTime() % 1000) / 10)
  return `${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(centiSeconds)}`
}

/** JSTの時刻を HH:MM 形式(集計期間表示用)で返す */
export function formatJstHm(date: Date): string {
  const { hour, minute } = getJstParts(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hour)}:${pad(minute)}`
}

/** ダウンロードファイル名用のタイムスタンプ文字列(YYYYMMDD-HHmmss)を生成する */
export function formatFileTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}
