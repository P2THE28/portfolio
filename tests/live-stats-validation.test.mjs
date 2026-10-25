import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseCodeforcesRatingHistory,
  parseCodeforcesSubmissions,
  parseCodeforcesUsers,
  parseGitHubEvents,
  parseGitHubRepositories,
  parseGitHubUser,
  unwrapCodeforcesResult,
} from '../src/lib/live-stats-validation.mjs'

test('accepts valid GitHub profile, repository, and activity responses', () => {
  assert.equal(parseGitHubUser({ login: 'p2the28', name: null, avatar_url: 'https://example.com/avatar.png', bio: null, html_url: 'https://github.com/p2the28', public_repos: 3, followers: 4 }).login, 'p2the28')
  assert.equal(parseGitHubRepositories([{ name: 'portfolio', description: null, language: 'TypeScript', stargazers_count: 1, forks_count: 0, html_url: 'https://github.com/p2the28/portfolio', updated_at: '2026-10-25T00:00:00Z', fork: false }])[0].name, 'portfolio')
  assert.equal(parseGitHubEvents([{ type: 'PushEvent', repo: { name: 'p2the28/portfolio' }, created_at: null }]).length, 1)
})

test('rejects incomplete or malformed GitHub responses', () => {
  assert.throws(() => parseGitHubUser({ login: 'p2the28', public_repos: '3' }), /malformed profile/)
  assert.throws(() => parseGitHubRepositories([{ name: 'repo', stargazers_count: -1 }]), /malformed repository/)
  assert.throws(() => parseGitHubEvents([{ type: 'PushEvent' }]), /malformed activity/)
})

test('validates Codeforces envelopes and profile, rating, and submission results', () => {
  assert.deepEqual(unwrapCodeforcesResult({ status: 'OK', result: [{ handle: 'p2the28' }] }), [{ handle: 'p2the28' }])
  assert.equal(parseCodeforcesUsers([{ handle: 'p2the28', rating: 1200 }])[0].handle, 'p2the28')
  assert.equal(parseCodeforcesRatingHistory([{ contestName: 'Round 1', newRating: 1200, ratingUpdateTimeSeconds: 1 }]).length, 1)
  assert.equal(parseCodeforcesSubmissions([{ verdict: 'OK', creationTimeSeconds: 1, problem: { contestId: 1, index: 'A', name: 'Problem' } }]).length, 1)
})

test('rejects malformed Codeforces envelopes and results', () => {
  assert.throws(() => unwrapCodeforcesResult({ status: 'FAILED', comment: 'bad request' }), /bad request/)
  assert.throws(() => unwrapCodeforcesResult({ status: 'OK' }), /invalid response/)
  assert.throws(() => parseCodeforcesUsers([{ handle: 'p2the28', rating: '1200' }]), /malformed profile/)
  assert.throws(() => parseCodeforcesRatingHistory([{ contestName: 'Round 1', newRating: 1200 }]), /malformed rating/)
  assert.throws(() => parseCodeforcesSubmissions([{ creationTimeSeconds: 1, problem: null }]), /malformed submission/)
})
