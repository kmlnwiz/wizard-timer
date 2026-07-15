import { getJstParts } from './time'

const JST_OFFSET_MS = 9 * 60 * 60 * 1000

/** JSTの年月日時分秒を絶対時刻(epoch ms)に変換する */
function jstToEpochMs(year: number, month: number, day: number, hour: number, minute: number, second: number): number {
  return Date.UTC(year, month - 1, day, hour, minute, second) - JST_OFFSET_MS
}

/**
 * 指定時刻から見た「次の月曜16:00(JST)」の epoch ms を返す。
 * 現在が月曜16:00以降(月曜16:00〜翌週月曜16:00未満)の場合は来週月曜16:00を返す。
 */
export function getNextMonday16(now: Date): number {
  const { year, month, day, hour, minute, second, weekday } = getJstParts(now)

  const todayTarget = jstToEpochMs(year, month, day, 16, 0, 0)
  const isPastMondayCutoffToday = weekday === 1 && jstToEpochMs(year, month, day, hour, minute, second) >= todayTarget

  let daysUntilMonday = (1 - weekday + 7) % 7
  if (daysUntilMonday === 0 && isPastMondayCutoffToday) {
    daysUntilMonday = 7
  }

  const targetDate = new Date(todayTarget + daysUntilMonday * 24 * 60 * 60 * 1000)
  return targetDate.getTime()
}

const HOUR_MS = 60 * 60 * 1000

export interface EventHourSlot {
  startMs: number
  endMs: number
  label: string
}

/**
 * 指定時刻から見て直近(過去方向)の「金曜16:00(JST)」の epoch ms を返す。
 * 金曜16:00より前の金曜(まだ当日16:00に達していない)場合は前週の金曜16:00を返す。
 */
export function getMostRecentFriday16(now: Date): number {
  const { year, month, day, hour, minute, second, weekday } = getJstParts(now)

  const todayTarget = jstToEpochMs(year, month, day, 16, 0, 0)
  const isBeforeFridayCutoffToday = weekday === 5 && jstToEpochMs(year, month, day, hour, minute, second) < todayTarget

  let daysSinceFriday = (weekday - 5 + 7) % 7
  if (daysSinceFriday === 0 && isBeforeFridayCutoffToday) {
    daysSinceFriday = 7
  }

  const targetDate = new Date(todayTarget - daysSinceFriday * 24 * 60 * 60 * 1000)
  return targetDate.getTime()
}

/**
 * 指定時刻が属するイベント(金曜16:00〜月曜16:00)の開始時刻(epoch ms)を返す。
 * 「今から見て次の月曜」ではなく直近(過去方向)の金曜16:00を直接算出するため、
 * イベント期間外(平日など)に呼んでも正しく直近の開始時刻を指す。
 */
export function getCurrentEventStart(now: Date): number {
  return getMostRecentFriday16(now)
}

/**
 * イベント開始(金曜16:00)を起点に、NN:55〜次の55分までの枠で72区分を生成する。
 * 最初の区分のみ「金曜16:00〜16:55」の55分、以降は「H:55〜(H+1):55」の60分区切りで、
 * 最終区分は「月曜14:55〜15:55」となる。
 */
export function getEventHourSlots(eventStartMs: number): EventHourSlot[] {
  const firstBoundary = eventStartMs + 55 * 60 * 1000
  const slots: EventHourSlot[] = [{ startMs: eventStartMs, endMs: firstBoundary, label: '16:00' }]

  for (let i = 0; i < 71; i++) {
    const startMs = firstBoundary + i * HOUR_MS
    const endMs = startMs + HOUR_MS
    const { hour, minute } = getJstParts(new Date(startMs))
    slots.push({ startMs, endMs, label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` })
  }

  return slots
}

const MINUTE_MS = 60 * 1000
const BOUNDARY_OFFSET_MS = 55 * MINUTE_MS

/**
 * 直近の「H:55」境界の epoch ms を返す(現在時刻を含む枠の開始時刻)。
 * JSTは常にUTC+9時間(端数なし)のため、時内の分・秒の位置はUTC epoch演算だけで判定できる。
 */
export function getCurrentClock55SlotStart(nowMs: number): number {
  const minuteOfHourMs = nowMs % HOUR_MS
  if (minuteOfHourMs >= BOUNDARY_OFFSET_MS) {
    return nowMs - (minuteOfHourMs - BOUNDARY_OFFSET_MS)
  }
  return nowMs - minuteOfHourMs - (HOUR_MS - BOUNDARY_OFFSET_MS)
}

/** 次の「H:55」境界までの残りms */
export function getMsUntilNextClock55(nowMs: number): number {
  const minuteOfHourMs = nowMs % HOUR_MS
  if (minuteOfHourMs < BOUNDARY_OFFSET_MS) {
    return BOUNDARY_OFFSET_MS - minuteOfHourMs
  }
  return HOUR_MS - minuteOfHourMs + BOUNDARY_OFFSET_MS
}
