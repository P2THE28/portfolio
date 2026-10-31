const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export function normalizeGitHubActivity(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('GitHub contributions response was malformed')
  const contributions = payload.contributions
  if (!Array.isArray(contributions) || contributions.length > 372 || (contributions.length > 0 && contributions.length < 350)) {
    throw new Error('GitHub contributions response did not contain a valid yearly calendar')
  }

  const activity = []
  const seen = new Set()
  for (const entry of contributions) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('GitHub contributions response contained a malformed day')
    const { date, count, level } = entry
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('GitHub contributions response contained an invalid date')
    const parsedDate = new Date(`${date}T00:00:00Z`)
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) throw new Error('GitHub contributions response contained an invalid date')
    if (!Number.isSafeInteger(count) || count < 0 || !Number.isInteger(level) || level < 0 || level > 4 || seen.has(date)) {
      throw new Error('GitHub contributions response contained invalid daily activity')
    }
    seen.add(date)
    activity.push({ date, count })
  }

  activity.sort((a, b) => a.date.localeCompare(b.date))
  for (let index = 1; index < activity.length; index += 1) {
    const previous = new Date(`${activity[index - 1].date}T00:00:00Z`)
    previous.setUTCDate(previous.getUTCDate() + 1)
    if (previous.toISOString().slice(0, 10) !== activity[index].date) throw new Error('GitHub contributions response contained a gap in the yearly calendar')
  }
  return activity
}

export async function fetchGitHubContributions(username, { fetchImpl = fetch, timeoutMs = 12_000 } = {}) {
  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username)) throw new Error('GitHub username is missing or invalid')
  let response
  try {
    response = await fetchImpl(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new Error('GitHub contributions request timed out')
    throw new Error('Could not reach the GitHub contributions service')
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('GitHub contributions service denied the request')
    if (response.status === 429) {
      const retryAfter = response.headers?.get?.('retry-after')
      throw new Error(`GitHub contributions service rate limited the request${retryAfter ? `; retry after ${retryAfter} seconds` : ''}`)
    }
    throw new Error(`GitHub contributions service returned HTTP ${response.status}`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('GitHub contributions service returned invalid JSON')
  }
  return normalizeGitHubActivity(payload)
}
