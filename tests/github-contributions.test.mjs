import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchGitHubContributions, normalizeGitHubActivity } from '../src/lib/github-contributions.mjs'

function calendar(start, length, count = 1) {
  const contributions = []
  const date = new Date(`${start}T00:00:00Z`)
  for (let index = 0; index < length; index += 1) {
    contributions.push({ date: date.toISOString().slice(0, 10), count, level: count ? 1 : 0 })
    date.setUTCDate(date.getUTCDate() + 1)
  }
  return { total: { lastYear: count * length }, contributions }
}

const response = (status, payload = {}, headers = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: (name) => headers[name.toLowerCase()] ?? null },
  json: async () => payload,
})

test('accepts actual rolling yearly payload length of 371 and preserves daily dates/counts', () => {
  const payload = calendar('2025-10-26', 371)
  const activity = normalizeGitHubActivity(payload)
  assert.equal(activity.length, 371)
  assert.deepEqual(activity[0], { date: '2025-10-26', count: 1 })
  assert.deepEqual(activity.at(-1), { date: '2026-10-31', count: 1 })
  assert.equal(activity.reduce((sum, day) => sum + day.count, 0), 371)
})

test('accepts a legitimate empty contribution response without inventing activity', () => {
  assert.deepEqual(normalizeGitHubActivity({ total: { lastYear: 0 }, contributions: [] }), [])
})

test('rejects malformed dates, gaps, invalid counts, and invalid usernames', async () => {
  const invalidDate = calendar('2026-01-01', 350)
  invalidDate.contributions[0].date = '2026-02-30'
  assert.throws(() => normalizeGitHubActivity(invalidDate), /invalid date/)
  const gap = calendar('2026-01-01', 351)
  gap.contributions.splice(10, 1)
  assert.throws(() => normalizeGitHubActivity(gap), /gap/)
  const invalidCount = calendar('2026-01-01', 350)
  invalidCount.contributions[0].count = -1
  assert.throws(() => normalizeGitHubActivity(invalidCount), /invalid daily activity/)
  await assert.rejects(fetchGitHubContributions('../bad'), /missing or invalid/)
})

test('reports GitHub authentication and rate-limit failures meaningfully', async () => {
  await assert.rejects(fetchGitHubContributions('P2THE28', { fetchImpl: async () => response(401) }), /denied/)
  await assert.rejects(fetchGitHubContributions('P2THE28', { fetchImpl: async () => response(429, {}, { 'retry-after': '30' }) }), /rate limited.*30 seconds/)
})

test('reports network, timeout, and malformed JSON failures', async () => {
  await assert.rejects(fetchGitHubContributions('P2THE28', { fetchImpl: async () => { throw new TypeError('network offline') } }), /Could not reach/)
  await assert.rejects(fetchGitHubContributions('P2THE28', { fetchImpl: async () => { const error = new Error('timeout'); error.name = 'TimeoutError'; throw error } }), /timed out/)
  await assert.rejects(fetchGitHubContributions('P2THE28', { fetchImpl: async () => ({ ...response(200), json: async () => { throw new SyntaxError('bad json') } }) }), /invalid JSON/)
})

test('retrieves and validates real-shaped contribution data for a valid username', async () => {
  const payload = calendar('2025-10-26', 371, 0)
  payload.contributions[4].count = 3
  payload.contributions[4].level = 2
  const activity = await fetchGitHubContributions('P2THE28', { fetchImpl: async (url) => {
    assert.equal(url, 'https://github-contributions-api.jogruber.de/v4/P2THE28?y=last')
    return response(200, payload)
  } })
  assert.equal(activity.length, 371)
  assert.equal(activity[4].count, 3)
  assert.equal(activity.filter((day) => day.count > 0).length, 1)
})
