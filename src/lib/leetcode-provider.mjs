/** @typedef {{ totalSolved: number, easy: number, medium: number, hard: number, contestRating: number | null, contestRanking: number | null, activity: Array<{date: string, count: number}>, recentAccepted: Array<{name: string, slug: string, difficulty: string | null, date: number, url: string}> }} LeetCodeData */
/** @typedef {{status: 'success' | 'cached', data: LeetCodeData, lastUpdated: string} | {status: 'unavailable', data: null, message: string} | {status: 'not_configured', data: null, message: string}} LeetCodeResult */

const ENDPOINT = 'https://leetcode.com/graphql'
const DEFAULT_TIMEOUT_MS = 10_000
const DEFAULT_REFRESH_INTERVAL_MS = 30 * 60 * 1000
const cache = new Map()
const inFlight = new Map()

const profileQuery = `query userProfile($username: String!) { matchedUser(username: $username) { username submitStats { acSubmissionNum { difficulty count } } userCalendar { submissionCalendar } } userContestRanking(username: $username) { rating globalRanking } }`
const recentQuery = `query recentAcSubmissions($username: String!) { recentAcSubmissionList(username: $username, limit: 8) { title titleSlug timestamp } }`

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNonNegative(value) {
  return Number.isSafeInteger(value) && value >= 0
}

function finitePositiveOrZero(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function unavailable(message) {
  return { status: 'unavailable', data: null, message }
}

function parseCounts(value) {
  if (!Array.isArray(value)) throw new Error('LeetCode profile is missing submission statistics')
  const counts = new Map()
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.difficulty !== 'string' || !finiteNonNegative(entry.count)) {
      throw new Error('LeetCode returned malformed submission statistics')
    }
    const key = entry.difficulty.toLowerCase()
    if (!['all', 'easy', 'medium', 'hard'].includes(key) || counts.has(key)) continue
    counts.set(key, entry.count)
  }
  for (const difficulty of ['all', 'easy', 'medium', 'hard']) {
    if (!counts.has(difficulty)) throw new Error(`LeetCode statistics are missing ${difficulty} count`)
  }
  return counts
}

function parseActivity(value) {
  if (typeof value !== 'string') throw new Error('LeetCode profile is missing submission calendar')
  let calendar
  try { calendar = JSON.parse(value) } catch { throw new Error('LeetCode returned a malformed submission calendar') }
  if (!isRecord(calendar)) throw new Error('LeetCode returned a malformed submission calendar')
  return Object.entries(calendar).map(([timestamp, count]) => {
    const seconds = Number(timestamp)
    if (!/^\d+$/.test(timestamp) || !Number.isFinite(seconds) || !finiteNonNegative(count)) throw new Error('LeetCode returned malformed activity data')
    return { date: new Date(seconds * 1000).toISOString().slice(0, 10), count }
  })
}

function normalizeProfile(payload, username) {
  if (!isRecord(payload) || !isRecord(payload.data) || !isRecord(payload.data.matchedUser)) {
    throw new Error('LeetCode profile was not found or returned incomplete data')
  }
  if (Array.isArray(payload.errors) && payload.errors.length) throw new Error('LeetCode GraphQL returned errors')
  const profile = payload.data.matchedUser
  if (typeof profile.username !== 'string' || profile.username.toLowerCase() !== username.toLowerCase()) {
    throw new Error('LeetCode returned a profile that does not match the configured username')
  }
  if (!isRecord(profile.submitStats) || !Object.hasOwn(profile.submitStats, 'acSubmissionNum')) {
    throw new Error('LeetCode profile is missing submission statistics')
  }
  if (!isRecord(profile.userCalendar) || !Object.hasOwn(profile.userCalendar, 'submissionCalendar')) {
    throw new Error('LeetCode profile is missing submission calendar')
  }
  if (!Object.hasOwn(payload.data, 'userContestRanking')) throw new Error('LeetCode profile is missing contest ranking data')
  const ranking = payload.data.userContestRanking
  if (ranking !== null && (!isRecord(ranking) || !finitePositiveOrZero(ranking.rating) || !finiteNonNegative(ranking.globalRanking))) {
    throw new Error('LeetCode returned malformed contest ranking data')
  }
  const counts = parseCounts(profile.submitStats.acSubmissionNum)
  return {
    totalSolved: counts.get('all'), easy: counts.get('easy'), medium: counts.get('medium'), hard: counts.get('hard'),
    contestRating: ranking?.rating ?? null, contestRanking: ranking?.globalRanking ?? null,
    activity: parseActivity(profile.userCalendar.submissionCalendar), recentAccepted: [],
  }
}

function normalizeRecent(payload) {
  if (Array.isArray(payload?.errors) && payload.errors.length) throw new Error('LeetCode recent submissions query failed')
  const items = payload?.data?.recentAcSubmissionList
  if (!Array.isArray(items)) throw new Error('LeetCode recent submissions are unavailable')
  return items.map((item) => {
    if (!isRecord(item) || typeof item.title !== 'string' || typeof item.titleSlug !== 'string' || !/^\d+$/.test(item.timestamp)) {
      throw new Error('LeetCode returned malformed recent submission data')
    }
    return { name: item.title, slug: item.titleSlug, difficulty: null, date: Number(item.timestamp), url: `https://leetcode.com/problems/${encodeURIComponent(item.titleSlug)}/` }
  })
}

async function requestGraphql(fetchImpl, query, username, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: `https://leetcode.com/${encodeURIComponent(username)}/` },
      body: JSON.stringify({ query, variables: { username } }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`LeetCode returned HTTP ${response.status}`)
    let payload
    try { payload = await response.json() } catch { throw new Error('LeetCode returned malformed JSON') }
    if (!isRecord(payload)) throw new Error('LeetCode returned malformed JSON')
    if (Array.isArray(payload.errors) && payload.errors.length) throw new Error('LeetCode GraphQL returned errors')
    return payload
  } finally {
    clearTimeout(timeout)
  }
}

/** @param {{username?: string, fetchImpl?: typeof fetch, now?: () => number, timeoutMs?: number, refreshIntervalMs?: number, forceRefresh?: boolean, cacheStore?: Map}} [options] */
export async function getLeetCodeStats(options = {}) {
  const username = options.username?.trim()
  if (!username) return { status: 'not_configured', data: null, message: 'Set LEETCODE_USERNAME to enable LeetCode statistics.' }
  if (!/^[A-Za-z0-9_-]{1,30}$/.test(username)) return unavailable('The configured LeetCode username is invalid.')

  const fetchImpl = options.fetchImpl ?? fetch
  const now = options.now ?? Date.now
  const store = options.cacheStore ?? cache
  const configuredInterval = Number(process.env.LEETCODE_REFRESH_INTERVAL_MS)
  const interval = options.refreshIntervalMs ?? (Number.isSafeInteger(configuredInterval) && configuredInterval > 0 ? configuredInterval : DEFAULT_REFRESH_INTERVAL_MS)
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const key = username.toLowerCase()
  const previous = store.get(key)
  const timestamp = now()
  if (!options.forceRefresh && previous && timestamp - previous.validatedAt < interval) {
    return { status: 'success', data: previous.data, lastUpdated: new Date(previous.validatedAt).toISOString() }
  }
  if (inFlight.has(key)) return inFlight.get(key)

  const refresh = (async () => {
    try {
      const profilePayload = await requestGraphql(fetchImpl, profileQuery, username, timeoutMs)
      const data = normalizeProfile(profilePayload, username)
      try {
        const recentPayload = await requestGraphql(fetchImpl, recentQuery, username, timeoutMs)
        data.recentAccepted = normalizeRecent(recentPayload)
      } catch { /* Recent submissions are optional; core validated profile data remains useful. */ }
      const validatedAt = now()
      store.set(key, { data, validatedAt })
      return { status: 'success', data, lastUpdated: new Date(validatedAt).toISOString() }
    } catch (error) {
      if (previous) return { status: 'cached', data: previous.data, lastUpdated: new Date(previous.validatedAt).toISOString() }
      return unavailable(error instanceof Error ? error.message : 'LeetCode statistics are temporarily unavailable.')
    } finally {
      inFlight.delete(key)
    }
  })()
  inFlight.set(key, refresh)
  return refresh
}

export function clearLeetCodeCache() {
  cache.clear()
  inFlight.clear()
}
