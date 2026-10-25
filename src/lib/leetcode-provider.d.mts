export type LeetCodeData = {
  totalSolved: number
  easy: number
  medium: number
  hard: number
  contestRating: number | null
  contestRanking: number | null
  activity: Array<{ date: string; count: number }>
  recentAccepted: Array<{ name: string; slug: string; difficulty: string | null; date: number; url: string }>
}

export type LeetCodeResult =
  | { status: 'success' | 'cached'; data: LeetCodeData; lastUpdated: string }
  | { status: 'unavailable'; data: null; message: string }
  | { status: 'not_configured'; data: null; message: string }

export function getLeetCodeStats(options?: {
  username?: string
  fetchImpl?: typeof fetch
  now?: () => number
  timeoutMs?: number
  refreshIntervalMs?: number
  forceRefresh?: boolean
  cacheStore?: Map<string, { data: LeetCodeData; validatedAt: number }>
}): Promise<LeetCodeResult>

export function clearLeetCodeCache(): void
