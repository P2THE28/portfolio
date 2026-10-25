export function parseGitHubUser(value: unknown): {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  html_url: string
  public_repos: number
  followers: number
}
export function parseGitHubRepositories(value: unknown): Array<{
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  html_url: string
  updated_at: string
  fork: boolean
}>
export function parseGitHubEvents(value: unknown): Array<{
  type: string
  repo: { name: string }
  created_at: string | null
  payload?: { commits?: Array<{ sha: string }> }
}>
export function unwrapCodeforcesResult(value: unknown): unknown
export function parseCodeforcesUsers(value: unknown): Array<{
  handle: string
  rating?: number
  rank?: string
  maxRating?: number
  maxRank?: string
}>
export function parseCodeforcesRatingHistory(value: unknown): Array<{
  contestName: string
  newRating: number
  ratingUpdateTimeSeconds: number
}>
export function parseCodeforcesSubmissions(value: unknown): Array<{
  verdict?: string
  contestId?: number
  problem: { contestId?: number; index?: string; name?: string; rating?: number }
  creationTimeSeconds: number
}>
