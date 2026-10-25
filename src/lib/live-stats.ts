import { profileConfig } from './profile-config'
import { getLeetCodeStats } from './leetcode-provider.mjs'
import type { LeetCodeResult } from './leetcode-provider.mjs'

const CACHE_TTL = 30 * 60 * 1000
const REQUEST_TIMEOUT = 12_000
const cache = new Map<string, { expiresAt: number; value: unknown }>()

export type ProviderResult<T> = {
  status: 'ok' | 'unavailable' | 'error'
  data: T | null
  message?: string
  updatedAt?: string
}

export type GitHubData = {
  profile: { username: string; name: string | null; avatarUrl: string; bio: string | null; url: string; publicRepos: number; followers: number }
  repositories: Array<{ name: string; description: string | null; language: string | null; stars: number; forks: number; url: string; updatedAt: string }>
  languages: Array<{ name: string; count: number }>
  recentActivity: Array<{ type: string; repo: string; createdAt: string; url: string }>
}

export type CodeforcesData = {
  profile: { handle: string; rating: number | null; rank: string | null; maxRating: number | null; maxRank: string | null }
  contests: number
  solved: number
  solvedByRating: Array<{ rating: number; count: number }>
  ratingHistory: Array<{ contest: string; rating: number; date: number }>
  recentAccepted: Array<{ name: string; contestId: number; index: string; date: number; url: string; rating: number | null }>
}

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value as T
  try {
    const value = await load()
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL })
    return value
  } catch (error) {
    if (hit) return hit.value as T
    throw error
  }
}

async function fetchJson<T>(url: string, headers: HeadersInit = {}): Promise<T> {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT) })
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`)
  return response.json() as Promise<T>
}

function result<T>(data: T): ProviderResult<T> {
  return { status: 'ok', data, updatedAt: new Date().toISOString() }
}

function failure<T>(error: unknown): ProviderResult<T> {
  const message = error instanceof Error ? error.message : 'Provider request failed'
  return { status: 'error', data: null, message }
}

type GhUser = { login: string; name: string | null; avatar_url: string; bio: string | null; html_url: string; public_repos: number; followers: number }
type GhRepo = { name: string; description: string | null; language: string | null; stargazers_count: number; forks_count: number; html_url: string; updated_at: string; fork: boolean }
type GhEvent = { type: string; repo: { name: string }; created_at: string | null; payload?: { commits?: Array<{ sha: string }> } }

export async function getGitHub(): Promise<ProviderResult<GitHubData>> {
  try {
    return result(await cached(`github:${profileConfig.githubUsername}`, async () => {
      const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
      const base = `https://api.github.com/users/${encodeURIComponent(profileConfig.githubUsername)}`
      const [user, repositories, events] = await Promise.all([
        fetchJson<GhUser>(base, headers),
        (async () => {
          const all: GhRepo[] = []
          for (let page = 1; page <= 3; page++) {
            const batch = await fetchJson<GhRepo[]>(`${base}/repos?per_page=100&sort=updated&page=${page}`, headers)
            all.push(...batch)
            if (batch.length < 100) break
          }
          return all.filter((repo) => !repo.fork).sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))
        })(),
        fetchJson<GhEvent[]>(`${base}/events/public?per_page=30`, headers).catch(() => []),
      ])
      const languageCounts = new Map<string, number>()
      for (const repo of repositories) if (repo.language) languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1)
      return {
        profile: { username: user.login, name: user.name, avatarUrl: user.avatar_url, bio: user.bio, url: user.html_url, publicRepos: user.public_repos, followers: user.followers },
        repositories: repositories.map((repo) => ({ name: repo.name, description: repo.description, language: repo.language, stars: repo.stargazers_count, forks: repo.forks_count, url: repo.html_url, updatedAt: repo.updated_at })),
        languages: [...languageCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        recentActivity: events.filter((event) => event.created_at).slice(0, 8).map((event) => ({ type: event.type, repo: event.repo.name, createdAt: event.created_at!, url: `https://github.com/${event.repo.name}` })),
      }
    }))
  } catch (error) { return failure(error) }
}

type CfEnvelope<T> = { status: string; result?: T; comment?: string }
type CfUser = { handle: string; rating?: number; rank?: string; maxRating?: number; maxRank?: string }
type CfRating = { contestName: string; newRating: number; ratingUpdateTimeSeconds: number }
type CfSubmission = { verdict?: string; contestId?: number; problem: { contestId?: number; index?: string; name?: string; rating?: number }; creationTimeSeconds: number }

async function codeforcesRequest<T>(method: string, params: string): Promise<T> {
  return cached(`cf:${method}:${params}`, async () => {
    const response = await fetchJson<CfEnvelope<T>>(`https://codeforces.com/api/${method}?${params}`, { 'User-Agent': 'PriyanshuPortfolio/1.0' })
    if (response.status !== 'OK' || response.result === undefined) throw new Error(response.comment || 'Codeforces returned an invalid response')
    return response.result
  })
}

export async function getCodeforces(): Promise<ProviderResult<CodeforcesData>> {
  try {
    const handle = encodeURIComponent(profileConfig.codeforcesHandle)
    const [users, history, submissions] = await Promise.all([
      codeforcesRequest<CfUser[]>('user.info', `handles=${handle}`),
      codeforcesRequest<CfRating[]>('user.rating', `handle=${handle}`).catch(() => []),
      codeforcesRequest<CfSubmission[]>('user.status', `handle=${handle}`),
    ])
    const user = users[0]
    if (!user) throw new Error('Codeforces profile was not found')
    const solvedProblems = new Map<string, CfSubmission['problem']>()
    for (const submission of submissions) {
      if (submission.verdict === 'OK' && submission.problem.contestId && submission.problem.index) {
        solvedProblems.set(`${submission.problem.contestId}-${submission.problem.index}`, submission.problem)
      }
    }
    const byRating = new Map<number, number>()
    for (const problem of solvedProblems.values()) if (problem.rating) byRating.set(problem.rating, (byRating.get(problem.rating) ?? 0) + 1)
    const latest = new Set<string>()
    const recentAccepted = submissions.filter((submission) => {
      if (submission.verdict !== 'OK' || !submission.problem.name || !submission.problem.contestId || !submission.problem.index) return false
      const key = `${submission.problem.contestId}-${submission.problem.index}`
      if (latest.has(key)) return false
      latest.add(key); return true
    }).slice(0, 8).map((submission) => ({ name: submission.problem.name!, contestId: submission.problem.contestId!, index: submission.problem.index!, date: submission.creationTimeSeconds, url: `https://codeforces.com/contest/${submission.problem.contestId}/problem/${submission.problem.index}`, rating: submission.problem.rating ?? null }))
    return result({
      profile: { handle: user.handle, rating: user.rating ?? null, rank: user.rank ?? null, maxRating: user.maxRating ?? null, maxRank: user.maxRank ?? null },
      contests: history.length,
      solved: solvedProblems.size,
      solvedByRating: [...byRating].map(([rating, count]) => ({ rating, count })).sort((a, b) => a.rating - b.rating),
      ratingHistory: history.map((item) => ({ contest: item.contestName, rating: item.newRating, date: item.ratingUpdateTimeSeconds })),
      recentAccepted,
    })
  } catch (error) { return failure(error) }
}

export async function getLeetCode(options: { forceRefresh?: boolean } = {}): Promise<LeetCodeResult> {
  const username = process.env.LEETCODE_USERNAME === undefined ? profileConfig.leetcodeUsername : process.env.LEETCODE_USERNAME
  return getLeetCodeStats({ username, forceRefresh: options.forceRefresh })
}

export async function getAllStats(options: { refreshLeetCode?: boolean } = {}) {
  const [github, codeforces, leetcode] = await Promise.all([getGitHub(), getCodeforces(), getLeetCode({ forceRefresh: options.refreshLeetCode })])
  return { github, codeforces, leetcode, generatedAt: new Date().toISOString() }
}
