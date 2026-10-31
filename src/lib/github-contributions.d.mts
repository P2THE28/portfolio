export type GitHubDailyActivity = { date: string; count: number }
export function normalizeGitHubActivity(payload: unknown): GitHubDailyActivity[]
export function fetchGitHubContributions(username: string, options?: { fetchImpl?: typeof fetch; timeoutMs?: number }): Promise<GitHubDailyActivity[]>
