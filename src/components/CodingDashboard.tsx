import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { PlatformIcon, type Platform } from '@/components/PlatformIcon'
import { profileLinks } from '@/lib/profile-config'
import type { CodeforcesData, GitHubData, ProviderResult } from '@/lib/live-stats'
import type { LeetCodeResult } from '@/lib/leetcode-provider.mjs'
import { leetCodeMetric } from '@/lib/leetcode-presentation.mjs'

type Stats = { github: ProviderResult<GitHubData>; codeforces: ProviderResult<CodeforcesData>; leetcode: LeetCodeResult; generatedAt: string }
type Provider = 'github' | 'codeforces'

const formatter = new Intl.NumberFormat('en')
const labelStyle = 'text-[11px] uppercase tracking-wider text-gray-500'
const panelStyle = 'theme-card rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5'

function StatCard({ label, value, sublabel, href, loading, unavailable }: { label: string; value: string | number | null; sublabel?: string; href?: string; loading: boolean; unavailable?: boolean }) {
  const content = loading ? <div className="mt-2 h-7 w-20 animate-pulse rounded bg-gray-800" /> : unavailable || value === null ? <p className="mt-2 text-xs text-gray-500">Unavailable</p> : <><p className="mt-1 text-2xl font-medium tabular-nums text-white">{value}</p>{sublabel && <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>}</>
  return <div className={panelStyle}>{href ? <a href={href} target="_blank" rel="noreferrer" className={`${labelStyle} transition hover:text-cyan-300`}>{label}</a> : <p className={labelStyle}>{label}</p>}{content}</div>
}

function BarList({ values, loading, unavailable }: { values: Array<{ name: string; count: number }>; loading: boolean; unavailable: boolean }) {
  const max = Math.max(1, ...values.map((item) => item.count))
  return loading ? <div className="space-y-4" aria-label="Loading chart">{[0, 1, 2].map((item) => <div key={item} className="h-5 animate-pulse rounded bg-gray-800" />)}</div> : unavailable || !values.length ? <p className="text-xs text-gray-500">Chart data unavailable.</p> : <div className="space-y-3">{values.slice(0, 8).map((item) => <div key={item.name}><div className="mb-1 flex justify-between gap-4 text-xs"><span className="truncate text-gray-300">{item.name}</span><span className="tabular-nums text-gray-500">{formatter.format(item.count)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(3, item.count / max * 100)}%` }} /></div></div>)}</div>
}

function RatingChart({ values, loading, unavailable }: { values: CodeforcesData['ratingHistory']; loading: boolean; unavailable: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollLeft = container.scrollWidth
  }, [values, loading, unavailable])
  const width = 720, height = 220, pad = 24
  const min = Math.min(...values.map((item) => item.rating)), max = Math.max(...values.map((item) => item.rating))
  const points = values.map((item, index) => `${pad + index / Math.max(1, values.length - 1) * (width - pad * 2)},${height - pad - ((item.rating - min) / Math.max(1, max - min)) * (height - pad * 2)}`).join(' ')
  return <section className={panelStyle}>
    <h3 className="flex items-center gap-2 font-semibold text-white"><PlatformIcon platform="codeforces" size={18} />Codeforces rating history</h3>
    {loading ? <div className="mt-5 h-48 animate-pulse rounded bg-gray-800" aria-label="Loading rating chart" /> : unavailable || values.length < 2 ? <p className="mt-4 text-sm text-gray-500">Rating history unavailable.</p> : <div ref={scrollRef} className="mt-4 overflow-x-auto"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Codeforces rating by contest" className="h-56 min-w-[540px] w-full"><line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="#374151"/><line x1={pad} x2={pad} y1={pad} y2={height - pad} stroke="#374151"/><polyline fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points}/>{values.map((item, index) => {const x = pad + index / Math.max(1, values.length - 1) * (width - pad * 2); const y = height - pad - ((item.rating - min) / Math.max(1, max - min)) * (height - pad * 2); return <circle key={`${item.date}-${index}`} cx={x} cy={y} r="4" fill="#22d3ee"><title>{`${item.contest}: ${item.rating}`}</title></circle>})}</svg><div className="flex justify-between text-xs text-gray-500"><span>{values[0]?.contest}</span><span>{values.at(-1)?.contest}</span></div></div>}
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
  const github = stats?.github.data
  const codeforces = stats?.codeforces.data
  const leetcode = stats?.leetcode.data
  const leetcodeConfigured = stats?.leetcode.status !== 'not_configured'

  return (
    <section id="coding-stats" className="coding-dashboard border-y border-[var(--border-color)] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-10 px-5 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 font-mono text-xs tracking-[0.18em] text-cyan-400">LIVE DEVELOPER DATA</p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Coding profiles</h2>
            <p className="mt-2 max-w-xl text-sm text-gray-400">Verified public stats from GitHub, Codeforces, and LeetCode.</p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-2.5 text-sm text-gray-300 transition hover:border-cyan-400/50 hover:text-white disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh data
          </button>
        </header>

        {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-900/60 bg-rose-950/20 px-4 py-3 text-sm text-rose-200"><span>{error}</span><button type="button" onClick={refresh} className="underline">Try again</button></div>}

        <div className="grid gap-4 lg:grid-cols-3">
          <section aria-labelledby="github-heading" className={`${panelStyle} space-y-5`}>
            <PlatformHeading id="github-heading" name="GitHub" subtitle={github ? `@${github.profile.username}` : 'Repositories and public activity'} href={profileLinks.github} />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Repositories" value={github?.profile.publicRepos ?? null} href={profileLinks.github} loading={loading} unavailable={providerError('github')} />
              <StatCard label="Followers" value={github?.profile.followers ?? null} href={profileLinks.github} loading={loading} unavailable={providerError('github')} />
            </div>
            {github && <div className="flex items-center gap-3 border-t border-[var(--border-color)] pt-4 text-xs text-gray-400"><img src={github.profile.avatarUrl} alt="GitHub avatar" className="h-9 w-9 rounded-full"/><span className="line-clamp-2">{github.profile.bio || 'Public profile connected'}</span></div>}
            {providerError('github') && !loading && <EmptyMessage unavailable provider="GitHub" />}
          </section>

          <section aria-labelledby="codeforces-heading" className={`${panelStyle} space-y-5`}>
            <PlatformHeading id="codeforces-heading" name="Codeforces" subtitle={codeforces?.profile.handle ? `@${codeforces.profile.handle}` : 'Contest performance'} href={profileLinks.codeforces} />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Current rating" value={codeforces?.profile.rating ?? null} sublabel={codeforces?.profile.rank ?? undefined} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
              <StatCard label="Peak rating" value={codeforces?.profile.maxRating ?? null} sublabel={codeforces?.profile.maxRank ?? undefined} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
              <StatCard label="Problems solved" value={codeforces?.solved ?? null} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
              <StatCard label="Contests" value={codeforces?.contests ?? null} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')} />
            </div>
            {providerError('codeforces') && !loading && <EmptyMessage unavailable provider="Codeforces" />}
          </section>

          <section aria-labelledby="leetcode-heading" className={`${panelStyle} space-y-5`}>
            <PlatformHeading id="leetcode-heading" name="LeetCode" subtitle="Problem-solving progress" href={profileLinks.leetcode} />
            {stats?.leetcode.status === 'unavailable' && <div role="status" className="rounded-xl border border-amber-900/50 bg-amber-950/15 p-3 text-xs text-amber-100"><p>LeetCode statistics are temporarily unavailable.</p><a className="mt-2 inline-block underline" href={profileLinks.leetcode} target="_blank" rel="noreferrer">Open public profile ↗</a></div>}
            {stats?.leetcode.status === 'not_configured' && <div role="status" className="rounded-xl border border-[var(--border-color)] p-3 text-xs text-gray-400">Set LEETCODE_USERNAME to enable statistics.</div>}
            {stats?.leetcode.status === 'cached' && <p role="status" className="text-xs text-amber-200/80">Saved data · Updated {new Date(stats.leetcode.lastUpdated).toLocaleString()}</p>}
            {leetcodeConfigured && <div className="grid grid-cols-2 gap-3">
              <StatCard label="Solved" value={leetCodeMetric(stats?.leetcode, 'totalSolved')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Easy" value={leetCodeMetric(stats?.leetcode, 'easy')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Medium" value={leetCodeMetric(stats?.leetcode, 'medium')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Hard" value={leetCodeMetric(stats?.leetcode, 'hard')} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode} />
              <StatCard label="Contest rating" value={leetcodeRating(stats?.leetcode)} href={profileLinks.leetcode} loading={loading} unavailable={!leetcode || leetcode?.contestRating === null} />
            </div>}
          </section>
        </div>

        <section aria-labelledby="analytics-heading" className="space-y-5">
          <div>
            <p className="mb-2 font-mono text-xs tracking-[0.18em] text-violet-300">TRENDS & CONSISTENCY</p>
            <h2 id="analytics-heading" className="text-2xl font-semibold tracking-tight text-white">Coding analytics</h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <RatingChart values={codeforces?.ratingHistory ?? []} loading={loading} unavailable={providerError('codeforces')} />
            <section className={panelStyle}><h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-200"><PlatformIcon platform="codeforces" size={17} />Codeforces solved by rating</h3><BarList values={(codeforces?.solvedByRating ?? []).map((item) => ({ name: `${item.rating} rating`, count: item.count }))} loading={loading} unavailable={providerError('codeforces')} /></section>
            <section className={panelStyle}><h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-200"><PlatformIcon platform="leetcode" size={17} />LeetCode by difficulty</h3><BarList values={leetcode ? [{ name: 'Easy', count: leetcode.easy }, { name: 'Medium', count: leetcode.medium }, { name: 'Hard', count: leetcode.hard }] : []} loading={loading} unavailable={!leetcode} /></section>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <ActivityHeatmap title="GitHub contributions" platform="github" activity={github?.activity ?? []} unit="contributions" coverageStart={github?.activity?.[0]?.date} coverageEnd={github?.activity?.at(-1)?.date} loading={loading} unavailable={!github?.activity} />
            <ActivityHeatmap title="Codeforces activity" platform="codeforces" activity={codeforces?.activity ?? []} unit="submissions" loading={loading} unavailable={providerError('codeforces')} />
            {stats?.leetcode.status !== 'not_configured' && <ActivityHeatmap title="LeetCode activity" platform="leetcode" activity={leetcode?.activity ?? []} unit="submissions" loading={loading} unavailable={!leetcode} />}
          </div>
        </section>

        <p className="text-right text-[11px] text-gray-500">{stats?.generatedAt ? `Data checked ${new Date(stats.generatedAt).toLocaleString()}` : 'Loading platform data'} · LeetCode uses an unofficial endpoint.</p>
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

function EmptyMessage({ unavailable, provider }: { unavailable: boolean; provider: string }) {
  return <p className="text-xs text-gray-500">{unavailable ? `${provider} data is unavailable right now.` : 'No public items found.'}</p>
}

function ActivityHeatmap({ title, platform, activity, unit, coverageStart, coverageEnd, loading, unavailable }: { title: string; platform: Platform; activity: Array<{ date: string; count: number }>; unit: 'contributions' | 'submissions'; coverageStart?: string; coverageEnd?: string; loading: boolean; unavailable: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollLeft = container.scrollWidth
  }, [activity, loading, unavailable])
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
    const covered = (!coverageStart || key >= coverageStart) && (!coverageEnd || key <= coverageEnd)
    return { key, date, count: date <= today && covered ? activityByDate.get(key) ?? 0 : null }
  })
  const maximum = Math.max(1, ...days.map((day) => day.count ?? 0))
  const yearTotal = days.reduce((total, day) => total + (day.count ?? 0), 0)
  const activeDays = days.filter((day) => (day.count ?? 0) > 0).length
  const weeks = Array.from({ length: 53 }, (_, week) => days.slice(week * 7, week * 7 + 7))
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']
  const cellSize = 11, cellGap = 3, labelWidth = 26, monthHeight = 18
  const columnStep = cellSize + cellGap
  const heatmapWidth = labelWidth + weeks.length * columnStep - cellGap
  const heatmapHeight = monthHeight + 7 * cellSize + 6 * cellGap
  return <section className={panelStyle}>
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-medium text-gray-200"><PlatformIcon platform={platform} size={17} />{title}</h3><p className="text-[11px] text-gray-500">Last year</p></div>
    {loading ? <div className="h-28 animate-pulse rounded bg-gray-800/70" aria-label="Loading activity" /> : unavailable ? <p className="text-xs text-gray-500">Activity data unavailable.</p> : <>
      <div ref={scrollRef} className="w-full overflow-x-auto pb-1">
      <svg viewBox={`0 0 ${heatmapWidth} ${heatmapHeight}`} role="img" aria-label={`${title}, last year`} className="block h-auto w-full min-w-[540px]" preserveAspectRatio="xMinYMin meet">
        {weeks.map((week, column) => {
          const firstOfMonth = week.find((day) => day.date.getUTCDate() === 1)
          return firstOfMonth ? <text key={`month-${column}`} x={labelWidth + column * columnStep} y="10" fill="#94a3b8" fontSize="9">{firstOfMonth.date.toLocaleString('en', { month: 'short', timeZone: 'UTC' })}</text> : null
        })}
        {weeks.flatMap((week, column) => week.map((day, row) => {
          const count = day.count
          const level = count === null || count === 0 ? -1 : count / maximum < 0.25 ? 0 : count / maximum < 0.5 ? 1 : count / maximum < 0.75 ? 2 : 3
          const fill = count === null || level < 0 ? 'var(--heatmap-empty)' : `var(--heatmap-level-${level + 1})`
          return <rect key={day.key} x={labelWidth + column * columnStep} y={monthHeight + row * columnStep} width={cellSize} height={cellSize} rx="2" fill={fill}>
            <title>{count === null ? `${day.key}: outside available history` : `${day.key}: ${count} ${unit}`}</title>
          </rect>
        }))}
        {dayLabels.map((label, row) => label ? <text key={`day-${row}`} x="0" y={monthHeight + row * columnStep + 8} fill="#94a3b8" fontSize="8">{label}</text> : null)}
      </svg>
      </div>
      <p className="mt-3 text-[11px] tabular-nums text-gray-500">{formatter.format(yearTotal)} {unit} · {formatter.format(activeDays)} active days</p>
    </>}
  </section>
}
