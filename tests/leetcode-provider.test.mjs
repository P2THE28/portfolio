import test from 'node:test'
import assert from 'node:assert/strict'
import { getLeetCodeStats } from '../src/lib/leetcode-provider.mjs'
import { leetCodeMetric } from '../src/lib/leetcode-presentation.mjs'

function profileResponse({ username = 'test_user', counts = [12, 4, 6, 2], calendar = '{}', ranking = { rating: 1400.5, globalRanking: 12345 }, errors } = {}) {
  return {
    ...(errors ? { errors } : {}),
    data: {
      matchedUser: {
        username,
        submitStats: { acSubmissionNum: ['All', 'Easy', 'Medium', 'Hard'].map((difficulty, index) => ({ difficulty, count: counts[index] })) },
        userCalendar: { submissionCalendar: calendar },
      },
      userContestRanking: ranking,
    },
  }
}

function response(payload, { ok = true, status = 200 } = {}) {
  return { ok, status, json: async () => payload }
}

function fetchSequence(...responses) {
  let index = 0
  return async () => responses[Math.min(index++, responses.length - 1)]
}

test('normalizes valid live profile data and accepted submission history', async () => {
  const fetchImpl = fetchSequence(
    response(profileResponse({ calendar: '{"1700000000":3}' })),
    response({ data: { recentAcSubmissionList: [{ title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1700000001' }] } }),
  )
  const result = await getLeetCodeStats({ username: 'test_user', fetchImpl, cacheStore: new Map(), now: () => 1_700_000_000_000 })
  assert.equal(result.status, 'success')
  assert.equal(result.data.totalSolved, 12)
  assert.equal(result.data.easy, 4)
  assert.equal(result.data.contestRating, 1400.5)
  assert.equal(result.data.activity[0].count, 3)
  assert.equal(result.data.recentAccepted[0].url, 'https://leetcode.com/problems/two-sum/')
  assert.ok(result.lastUpdated)
})

test('rejects missing profile and incomplete statistics instead of treating them as zero', async () => {
  for (const payload of [
    { data: { matchedUser: null, userContestRanking: null } },
    { data: { ...profileResponse().data, matchedUser: { username: 'test_user', submitStats: { acSubmissionNum: [{ difficulty: 'Easy', count: 0 }] }, userCalendar: { submissionCalendar: '{}' } } } },
  ]) {
    const result = await getLeetCodeStats({ username: 'test_user', fetchImpl: fetchSequence(response(payload)), cacheStore: new Map() })
    assert.equal(result.status, 'unavailable')
    assert.equal(result.data, null)
  }
})

test('reports HTTP, timeout, malformed JSON, and GraphQL errors as unavailable', async () => {
  const failures = [
    async () => response({}, { ok: false, status: 503 }),
    async () => { throw new DOMException('Aborted', 'AbortError') },
    async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json') } }),
    async () => response(profileResponse({ errors: [{ message: 'blocked' }] })),
  ]
  for (const fetchImpl of failures) {
    const result = await getLeetCodeStats({ username: 'test_user', fetchImpl, cacheStore: new Map(), timeoutMs: 10 })
    assert.equal(result.status, 'unavailable')
    assert.equal(result.data, null)
  }
})

test('uses cached validated data after refresh failure and does not overwrite it', async () => {
  const cacheStore = new Map()
  const initial = await getLeetCodeStats({ username: 'test_user', fetchImpl: fetchSequence(response(profileResponse()), response({ data: { recentAcSubmissionList: [] } })), cacheStore, now: () => 1000 })
  assert.equal(initial.status, 'success')
  const next = await getLeetCodeStats({ username: 'test_user', fetchImpl: fetchSequence(response({ errors: [{ message: 'bad' }] })), cacheStore, now: () => 5000, forceRefresh: true })
  assert.equal(next.status, 'cached')
  assert.equal(next.data.totalSolved, 12)
  assert.equal(next.lastUpdated, new Date(1000).toISOString())
  assert.equal(cacheStore.get('test_user').data.totalSolved, 12)
})

test('returns unavailable when no valid cache exists', async () => {
  const result = await getLeetCodeStats({ username: 'test_user', fetchImpl: async () => { throw new Error('offline') }, cacheStore: new Map(), forceRefresh: true })
  assert.equal(result.status, 'unavailable')
  assert.equal(result.data, null)
})

test('distinguishes missing and invalid usernames', async () => {
  assert.equal((await getLeetCodeStats({ username: '  ' })).status, 'not_configured')
  assert.equal((await getLeetCodeStats({ username: 'bad/name' })).status, 'unavailable')
})

test('valid zero counts are preserved as data; failed data is never zero-filled', async () => {
  const valid = await getLeetCodeStats({ username: 'test_user', fetchImpl: fetchSequence(response(profileResponse({ counts: [0, 0, 0, 0] })), response({ data: { recentAcSubmissionList: [] } })), cacheStore: new Map() })
  assert.equal(valid.status, 'success')
  assert.equal(valid.data.totalSolved, 0)
  const invalid = await getLeetCodeStats({ username: 'test_user', fetchImpl: fetchSequence(response({ data: { matchedUser: null } })), cacheStore: new Map() })
  assert.equal(invalid.status, 'unavailable')
  assert.equal(invalid.data, null)
})

test('unavailable and unconfigured states never render a metric as zero', () => {
  assert.equal(leetCodeMetric({ status: 'unavailable', data: null, message: 'offline' }, 'totalSolved'), null)
  assert.equal(leetCodeMetric({ status: 'not_configured', data: null, message: 'missing username' }, 'easy'), null)
  assert.equal(leetCodeMetric(null, 'hard'), null)
  assert.equal(leetCodeMetric({ status: 'success', data: { totalSolved: 0 } }, 'totalSolved'), 0)
})
