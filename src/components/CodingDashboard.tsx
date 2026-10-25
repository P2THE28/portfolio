import { Fragment, useCallback, useEffect, useState } from 'react'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { PlatformIcon, type Platform } from '@/components/PlatformIcon'
import { profileConfig, profileLinks } from '@/lib/profile-config'
import type { CodeforcesData, GitHubData, ProviderResult } from '@/lib/live-stats'
import type { LeetCodeResult } from '@/lib/leetcode-provider.mjs'
import { leetCodeMetric } from '@/lib/leetcode-presentation.mjs'

type Stats = { github: ProviderResult<GitHubData>; codeforces: ProviderResult<CodeforcesData>; leetcode: LeetCodeResult; generatedAt: string }
type Provider = 'github' | 'codeforces'

const formatter = new Intl.NumberFormat('en')
const labelStyle = 'text-[11px] uppercase tracking-wider text-gray-500'
const panelStyle = 'rounded-xl border border-gray-800/80 bg-[#111117] p-4'

function StatCard({ label, value, sublabel, href, loading, unavailable }: { label: string; value: string | number | null; sublabel?: string; href?: string; loading: boolean; unavailable?: boolean }) {
  const content = loading ? <div className="mt-2 h-7 w-20 animate-pulse rounded bg-gray-800" /> : unavailable || value === null ? <p className="mt-2 text-xs text-gray-500">Unavailable</p> : <><p className="mt-1 text-2xl font-medium tabular-nums text-white">{value}</p>{sublabel && <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>}</>
  return <div className={panelStyle}>{href ? <a href={href} target="_blank" rel="noreferrer" className={`${labelStyle} inline-flex items-center gap-2 hover:text-cyan-300`}>{label}<ExternalLink size={12} /></a> : <p className={labelStyle}>{label}</p>}{content}</div>
}

function BarList({ values, loading, unavailable }: { values: Array<{ name: string; count: number }>; loading: boolean; unavailable: boolean }) {
  const max = Math.max(1, ...values.map((item) => item.count))
  return loading ? <div className="space-y-4" aria-label="Loading chart">{[0, 1, 2].map((item) => <div key={item} className="h-5 animate-pulse rounded bg-gray-800" />)}</div> : unavailable || !values.length ? <p className="text-xs text-gray-500">Chart data unavailable.</p> : <div className="space-y-3">{values.slice(0, 8).map((item) => <div key={item.name}><div className="mb-1 flex justify-between gap-4 text-xs"><span className="truncate text-gray-300">{item.name}</span><span className="tabular-nums text-gray-500">{formatter.format(item.count)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(3, item.count / max * 100)}%` }} /></div></div>)}</div>
}

function RatingChart({ values, loading, unavailable }: { values: CodeforcesData['ratingHistory']; loading: boolean; unavailable: boolean }) {
  const width = 720, height = 220, pad = 24
  const min = Math.min(...values.map((item) => item.rating)), max = Math.max(...values.map((item) => item.rating))
  const points = values.map((item, index) => `${pad + index / Math.max(1, values.length - 1) * (width - pad * 2)},${height - pad - ((item.rating - min) / Math.max(1, max - min)) * (height - pad * 2)}`).join(' ')
  return <section className={panelStyle}>
    <h3 className="font-semibold text-white">Codeforces rating history</h3>
    {loading ? <div className="mt-5 h-48 animate-pulse rounded bg-gray-800" aria-label="Loading rating chart" /> : unavailable || values.length < 2 ? <p className="mt-4 text-sm text-gray-500">Rating history unavailable.</p> : <div className="mt-4 overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Codeforces rating by contest" className="h-56 min-w-[540px] w-full"><line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="#374151"/><line x1={pad} x2={pad} y1={pad} y2={height - pad} stroke="#374151"/><polyline fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points}/>{values.map((item, index) => {const x = pad + index / Math.max(1, values.length - 1) * (width - pad * 2); const y = height - pad - ((item.rating - min) / Math.max(1, max - min)) * (height - pad * 2); return <circle key={`${item.date}-${index}`} cx={x} cy={y} r="4" fill="#22d3ee"><title>{`${item.contest}: ${item.rating}`}</title></circle>})}</svg><div className="flex justify-between text-xs text-gray-500"><span>{values[0]?.contest}</span><span>{values.at(-1)?.contest}</span></div></div>}
  </section>
}

export function CodingDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const refresh = useCallback(() => setRetryKey((current) => current + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetch('/api/stats?refresh=leetcode')
      .then(async (response) => {
        if (!response.ok) throw new Error(`Portfolio stats request failed (${response.status})`)
        return response.json() as Promise<Stats>
      })
      .then((data) => { if (active) setStats(data) })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load portfolio statistics') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retryKey])

  const providerError = (key: Provider) => stats?.[key].status !== 'ok'
  const repositories = stats?.github.data?.repositories ?? []
  const selectedRepositories = profileConfig.featuredRepositories
    .map((name) => repositories.find((repo) => repo.name.toLowerCase() === name.toLowerCase()))
    .filter((repo): repo is GitHubData['repositories'][number] => Boolean(repo))
  const projects = [...selectedRepositories, ...repositories.filter((repo) => !selectedRepositories.some((item) => item.name === repo.name))].slice(0, 6)
  const github = stats?.github.data
  const codeforces = stats?.codeforces.data
  const leetcode = stats?.leetcode.data
  const leetcodeConfigured = stats?.leetcode.status !== 'not_configured'

  return (
    <section id="coding-stats" className="border-y border-gray-900 bg-[#0d0d13] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-14 px-5 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 font-mono text-xs tracking-[0.18em] text-cyan-400">PLATFORM ACTIVITY</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Coding statistics</h2>
            <p className="mt-2 max-w-xl text-sm text-gray-400">Live public data, organized by platform.</p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-600 hover:text-white disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </header>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-900/60 bg-rose-950/20 px-4 py-3 text-sm text-rose-200"><span>{error}</span><button type="button" onClick={refresh} className="underline">Try again</button></div>}

        <section aria-labelledby="github-heading" className="space-y-5">
          <PlatformHeading id="github-heading" name="GitHub" subtitle="Repositories, followers, languages, and recent activity" href={profileLinks.github} />
          {github && <div className="flex items-center gap-3 text-sm text-gray-400"><img src={github.profile.avatarUrl} alt="GitHub profile avatar" className="h-9 w-9 rounded-full"/><span className="font-medium text-gray-200">{github.profile.name || github.profile.username}</span><span>@{github.profile.username}</span>{github.profile.bio && <span className="hidden border-l border-gray-800 pl-3 sm:inline">{github.profile.bio}</span>}</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Public repositories" value={github?.profile.publicRepos ?? null} href={profileLinks.github} loading={loading} unavailable={providerError('github')} />
            <StatCard label="Followers" value={github?.profile.followers ?? null} href={profileLinks.github} loading={loading} unavailable={providerError('github')} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={panelStyle}>
              <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-medium text-gray-200">Recent repositories</h3><a className="text-xs text-gray-500 hover:text-cyan-300" href={`${profileLinks.github}?tab=repositories`} target="_blank" rel="noreferrer">View all ↗</a></div>
              {loading ? <SkeletonList /> : projects.length ? <div className="divide-y divide-gray-800/80">{projects.slice(0, 4).map((repo) => <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"><span className="min-w-0"><span className="block truncate text-sm text-gray-200">{repo.name}</span><span className="mt-1 block truncate text-xs text-gray-500">{repo.description || 'No description'}</span></span><span className="shrink-0 text-xs text-gray-500">{repo.language || '—'} · ★ {repo.stars}</span></a>)}</div> : <EmptyMessage unavailable={providerError('github')} provider="GitHub" />}
            </section>
            <section className={panelStyle}>
              <h3 className="mb-4 text-sm font-medium text-gray-200">Languages across repositories</h3>
              <BarList values={github?.languages ?? []} loading={loading} unavailable={providerError('github')} />
            </section>
          </div>
          {github?.recentActivity.length ? <section className={panelStyle}><h3 className="mb-3 text-sm font-medium text-gray-200">Recent public activity</h3><div className="divide-y divide-gray-800/80">{github.recentActivity.slice(0, 4).map((item) => <a key={`${item.type}-${item.createdAt}-${item.repo}`} href={item.url} target="_blank" rel="noreferrer" className="flex justify-between gap-4 py-2.5 text-xs"><span className="truncate text-gray-300">{item.type.replace('Event', '')} · {item.repo}</span><time className="shrink-0 text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</time></a>)}</div></section> : null}
        </section>

        <section aria-labelledby="codeforces-heading" className="space-y-5 border-t border-gray-900 pt-10">
          <PlatformHeading id="codeforces-heading" name="Codeforces" subtitle="Contest performance and accepted problems" href={profileLinks.codeforces} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Current rating" value={codeforces?.profile.rating ?? null} sublabel={codeforces?.profile.rank ?? undefined} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
            <StatCard label="Peak rating" value={codeforces?.profile.maxRating ?? null} sublabel={codeforces?.profile.maxRank ?? undefined} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
            <StatCard label="Contests" value={codeforces?.contests ?? null} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
            <StatCard label="Unique problems solved" value={codeforces?.solved ?? null} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <RatingChart values={codeforces?.ratingHistory ?? []} loading={loading} unavailable={providerError('codeforces')} />
            <section className={panelStyle}><h3 className="mb-4 text-sm font-medium text-gray-200">Solved problems by rating</h3><BarList values={(codeforces?.solvedByRating ?? []).map((item) => ({ name: `${item.rating} rating`, count: item.count }))} loading={loading} unavailable={providerError('codeforces')} /></section>
          </div>
          <ActivityHeatmap title="Codeforces submission activity" activity={codeforces?.activity ?? []} color="green" loading={loading} unavailable={providerError('codeforces')} />
        </section>

        <section aria-labelledby="leetcode-heading" className="space-y-5 border-t border-gray-900 pt-10">
          <PlatformHeading id="leetcode-heading" name="LeetCode" subtitle="Problem-solving progress and activity" href={profileLinks.leetcode} />
          {stats?.leetcode.status === 'unavailable' && <div role="status" className="rounded-lg border border-amber-900/50 bg-amber-950/15 px-4 py-3 text-sm text-amber-100"><p>LeetCode statistics are temporarily unavailable.</p><a className="mt-1 inline-block text-amber-200/70 underline" href={profileLinks.leetcode} target="_blank" rel="noreferrer">Open public profile ↗</a></div>}
          {stats?.leetcode.status === 'not_configured' && <div role="status" className="rounded-lg border border-gray-800 px-4 py-3 text-sm text-gray-400">Set LEETCODE_USERNAME in the environment to enable statistics.</div>}
          {stats?.leetcode.status === 'cached' && <p role="status" className="text-xs text-amber-200/80">Showing saved data · Updated {new Date(stats.leetcode.lastUpdated).toLocaleString()}</p>}
          {leetcodeConfigured && <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Solved" value={leetCodeMetric(stats?.leetcode, 'totalSolved')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Easy" value={leetCodeMetric(stats?.leetcode, 'easy')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Medium" value={leetCodeMetric(stats?.leetcode, 'medium')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Hard" value={leetCodeMetric(stats?.leetcode, 'hard')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Contest rating" value={leetcodeRating(stats?.leetcode)} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <section className={panelStyle}><h3 className="mb-4 text-sm font-medium text-gray-200">Solved by difficulty</h3><BarList values={leetcode ? [{ name: 'Easy', count: leetcode.easy }, { name: 'Medium', count: leetcode.medium }, { name: 'Hard', count: leetcode.hard }] : []} loading={loading} unavailable={!leetcode} /></section>
            </div>
            <ActivityHeatmap title="LeetCode submission activity" activity={leetcode?.activity ?? []} color="cyan" loading={loading} unavailable={!leetcode} />
          </>}
        </section>

        <p className="text-right text-[11px] text-gray-600">{stats?.generatedAt ? `Data checked ${new Date(stats.generatedAt).toLocaleString()}` : 'Loading platform data'} · LeetCode uses an unofficial endpoint.</p>
      </div>
    </section>
  )
}

function leetcodeRating(result: LeetCodeResult | undefined) {
  const rating = leetCodeMetric(result, 'contestRating')
  return rating === null ? null : Math.round(rating)
}

function PlatformHeading({ id, name, subtitle, href }: { id: string; name: string; subtitle: string; href: string }) {
  const platform = name.toLowerCase() as Platform
  return <header className="flex flex-wrap items-baseline justify-between gap-2"><div><h3 id={id} className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white"><PlatformIcon platform={platform} size={20} />{name}</h3><p className="mt-1 text-xs text-gray-500">{subtitle}</p></div><a href={href} target="_blank" rel="noreferrer" aria-label={`Open ${name} profile`} className="text-gray-500 hover:text-cyan-300"><PlatformIcon platform={platform} size={18} /></a></header>
}

function SkeletonList() {
  return <div className="space-y-3" aria-label="Loading items">{[0, 1, 2].map((item) => <div key={item} className="h-8 animate-pulse rounded bg-gray-800/70" />)}</div>
}

function EmptyMessage({ unavailable, provider }: { unavailable: boolean; provider: string }) {
  return <p className="text-xs text-gray-500">{unavailable ? `${provider} data is unavailable right now.` : 'No public items found.'}</p>
}

function ActivityHeatmap({ title, activity, color, loading, unavailable }: { title: string; activity: Array<{ date: string; count: number }>; color: 'green' | 'cyan'; loading: boolean; unavailable: boolean }) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const firstDay = new Date(today)
  firstDay.setUTCDate(firstDay.getUTCDate() - 363)
  firstDay.setUTCDate(firstDay.getUTCDate() - firstDay.getUTCDay())
  const activityByDate = new Map(activity.map((item) => [item.date, item.count]))
  const days = Array.from({ length: 53 * 7 }, (_, index) => {
    const date = new Date(firstDay)
    date.setUTCDate(firstDay.getUTCDate() + index)
    const key = date.toISOString().slice(0, 10)
    return { key, date, count: date <= today ? activityByDate.get(key) ?? 0 : 0 }
  })
  const maximum = Math.max(1, ...days.map((day) => day.count))
  const yearTotal = days.reduce((total, day) => total + day.count, 0)
  const activeDays = days.filter((day) => day.count > 0).length
  const weeks = Array.from({ length: 53 }, (_, week) => days.slice(week * 7, week * 7 + 7))
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']
  const colorClass = color === 'green'
    ? ['bg-green-950', 'bg-green-900', 'bg-green-700', 'bg-green-500']
    : ['bg-cyan-950', 'bg-cyan-900', 'bg-cyan-700', 'bg-cyan-500']

  return <section className={panelStyle}>
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-medium text-gray-200">{title}</h3><p className="text-[11px] text-gray-500">Last year</p></div>
    {loading ? <div className="h-28 animate-pulse rounded bg-gray-800/70" aria-label="Loading activity" /> : unavailable ? <p className="text-xs text-gray-500">Activity data unavailable.</p> : <>
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          <div className="mb-1 grid grid-cols-[24px_repeat(53,minmax(0,1fr))] gap-[3px] text-[10px] text-gray-500">
            <span />
            {weeks.map((week, index) => {
              const firstOfMonth = week.find((day) => day.date.getUTCDate() === 1)
              return <span key={index} className="h-4 whitespace-nowrap">{firstOfMonth?.date.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}</span>
            })}
          </div>
          <div className="grid grid-cols-[24px_repeat(53,minmax(0,1fr))] gap-x-[3px] gap-y-[3px]">
            {dayLabels.map((label, row) => <Fragment key={row}>
              <span className="flex h-[11px] items-center text-[9px] leading-none text-gray-600">{label}</span>
              {weeks.map((week, column) => {
                const day = week[row]
                const level = day.count === 0 ? -1 : day.count / maximum < 0.25 ? 0 : day.count / maximum < 0.5 ? 1 : day.count / maximum < 0.75 ? 2 : 3
                const shade = level < 0 ? 'bg-gray-800/80' : colorClass[level]
                return <span key={`${column}-${day.key}`} title={`${day.key}: ${day.count} submissions`} aria-label={`${day.key}: ${day.count} submissions`} className={`h-[11px] rounded-[2px] ${shade}`} />
              })}
            </Fragment>)}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] tabular-nums text-gray-500">{formatter.format(yearTotal)} submissions · {formatter.format(activeDays)} active days</p>
    </>}
  </section>
}
