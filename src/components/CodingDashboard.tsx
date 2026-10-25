import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Github, RefreshCw } from 'lucide-react'
import { profileConfig, profileLinks } from '@/lib/profile-config'
import type { CodeforcesData, GitHubData, ProviderResult } from '@/lib/live-stats'
import type { LeetCodeResult } from '@/lib/leetcode-provider.mjs'
import { leetCodeMetric } from '@/lib/leetcode-presentation.mjs'

type Stats = { github: ProviderResult<GitHubData>; codeforces: ProviderResult<CodeforcesData>; leetcode: LeetCodeResult; generatedAt: string }
type Provider = 'github' | 'codeforces'

const formatter = new Intl.NumberFormat('en')
const labelStyle = 'text-xs uppercase tracking-widest text-gray-500'
const panelStyle = 'rounded-2xl border border-gray-800 bg-[#12121b] p-5 sm:p-6'

function StatCard({ label, value, sublabel, href, loading, unavailable }: { label: string; value: string | number | null; sublabel?: string; href?: string; loading: boolean; unavailable?: boolean }) {
  const content = loading ? <div className="h-9 w-24 animate-pulse rounded bg-gray-800" /> : unavailable || value === null ? <p className="mt-3 text-sm text-gray-500">Unavailable</p> : <><p className="mt-2 text-3xl font-semibold text-white">{value}</p>{sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}</>
  return <div className={panelStyle}>{href ? <a href={href} target="_blank" rel="noreferrer" className={`${labelStyle} inline-flex items-center gap-2 hover:text-cyan-300`}>{label}<ExternalLink size={12} /></a> : <p className={labelStyle}>{label}</p>}{content}</div>
}

function BarList({ title, values, loading, unavailable }: { title: string; values: Array<{ name: string; count: number }>; loading: boolean; unavailable: boolean }) {
  const max = Math.max(1, ...values.map((item) => item.count))
  return <section className={panelStyle}>
    <h3 className="font-semibold text-white">{title}</h3>
    {loading ? <div className="mt-5 space-y-4" aria-label="Loading chart">{[0, 1, 2, 3].map((item) => <div key={item} className="h-5 animate-pulse rounded bg-gray-800" />)}</div> : unavailable || !values.length ? <p className="mt-4 text-sm text-gray-500">Chart data unavailable.</p> : <div className="mt-5 space-y-4">{values.slice(0, 8).map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between gap-4 text-sm"><span className="truncate text-gray-300">{item.name}</span><span className="text-gray-500">{formatter.format(item.count)}</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(3, item.count / max * 100)}%` }} /></div></div>)}</div>}
  </section>
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
    setLoading(true); setError(null)
    fetch('/api/stats?refresh=leetcode').then(async (response) => {
      if (!response.ok) throw new Error(`Portfolio stats request failed (${response.status})`)
      return response.json() as Promise<Stats>
    }).then((data) => { if (active) setStats(data) }).catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load portfolio statistics') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [retryKey])

  const providerError = (key: Provider) => stats?.[key].status !== 'ok'
  const projects = (() => {
    const repos = stats?.github.data?.repositories ?? []
    const selected = profileConfig.featuredRepositories.map((name) => repos.find((repo) => repo.name.toLowerCase() === name.toLowerCase())).filter((repo): repo is GitHubData['repositories'][number] => Boolean(repo))
    return [...selected, ...repos.filter((repo) => !selected.some((item) => item.name === repo.name))].slice(0, 6)
  })()
  const languages = stats?.github.data?.languages ?? []
  const cf = stats?.codeforces.data
  const lc = stats?.leetcode.data

  return <section id="coding-stats" className="relative py-20 sm:py-24">
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-3 font-mono text-sm text-cyan-400">LIVE FROM THE PLATFORMS</p><h2 className="text-3xl font-bold sm:text-4xl">Coding statistics</h2><p className="mt-3 max-w-2xl text-gray-400">Public profile data from GitHub, Codeforces, and LeetCode. Each provider can update independently.</p></div><button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>Refresh</button></div>
      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-200"><span>{error}</span><button type="button" onClick={refresh} className="underline">Try again</button></div>}

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GitHub public repositories" value={stats?.github.data?.profile.publicRepos ?? null} href={profileLinks.github} loading={loading} unavailable={providerError('github')}/>
        <StatCard label="GitHub followers" value={stats?.github.data?.profile.followers ?? null} href={profileLinks.github} loading={loading} unavailable={providerError('github')}/>
        <StatCard label="Codeforces rating" value={cf?.profile.rating ?? null} sublabel={cf?.profile.rank ?? undefined} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')}/>
        <StatCard label="Codeforces max rating" value={cf?.profile.maxRating ?? null} sublabel={cf?.profile.maxRank ?? undefined} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')}/>
        <StatCard label="Codeforces contests" value={cf?.contests ?? null} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')}/>
        <StatCard label="Codeforces unique solved" value={cf?.solved ?? null} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')}/>
        {stats?.leetcode.status !== 'not_configured' && <>
        <StatCard label="LeetCode solved" value={leetCodeMetric(stats?.leetcode, 'totalSolved')} href={profileLinks.leetcode} loading={loading} unavailable={!lc}/>
        <StatCard label="LeetCode contest rating" value={(() => { const value = leetCodeMetric(stats?.leetcode, 'contestRating'); return value === null ? null : Math.round(value) })()} href={profileLinks.leetcode} loading={loading} unavailable={!lc}/>
        </>}
      </div>

      {stats?.leetcode.status === 'unavailable' && <div role="status" className="mb-6 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4 text-sm text-amber-100"><p>LeetCode statistics are temporarily unavailable.</p><p className="mt-1 text-amber-200/70">{stats.leetcode.message}</p><a className="mt-2 inline-block underline" href={profileLinks.leetcode} target="_blank" rel="noreferrer">View public LeetCode profile</a></div>}
      {stats?.leetcode.status === 'not_configured' && <div role="status" className="mb-6 rounded-xl border border-gray-800 bg-[#12121b] p-4 text-sm text-gray-400">LeetCode integration is not configured. Set LEETCODE_USERNAME to enable statistics.</div>}
      {stats?.leetcode.status === 'cached' && <p role="status" className="mb-4 text-sm text-amber-200">Showing saved LeetCode statistics, last updated {new Date(stats.leetcode.lastUpdated).toLocaleString()}.</p>}
      {stats?.leetcode.status !== 'not_configured' && <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {(['easy', 'medium', 'hard'] as const).map((difficulty) => <StatCard key={difficulty} label={`LeetCode ${difficulty}`} value={leetCodeMetric(stats?.leetcode, difficulty)} href={profileLinks.leetcode} loading={loading} unavailable={!lc}/>) }
      </div>}

      <div className="mb-10 grid gap-4 lg:grid-cols-2"><RatingChart values={cf?.ratingHistory ?? []} loading={loading} unavailable={providerError('codeforces')}/><BarList title="Codeforces solved problems by rating" values={(cf?.solvedByRating ?? []).map((item) => ({ name: `${item.rating} rating`, count: item.count }))} loading={loading} unavailable={providerError('codeforces')}/><BarList title="GitHub languages across public repositories" values={languages} loading={loading} unavailable={providerError('github')}/>{stats?.leetcode.status !== 'not_configured' && <BarList title="LeetCode solved by difficulty" values={lc ? [{ name: 'Easy', count: lc.easy }, { name: 'Medium', count: lc.medium }, { name: 'Hard', count: lc.hard }] : []} loading={loading} unavailable={!lc}/>}</div>

      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <section className={panelStyle}><div className="mb-5 flex items-center justify-between"><h3 className="font-semibold text-white">Recent public repositories</h3><a className="text-sm text-cyan-300 hover:text-cyan-200" href={`${profileLinks.github}?tab=repositories`} target="_blank" rel="noreferrer">All repositories <ExternalLink size={13} className="inline"/></a></div>{loading ? <div className="space-y-3">{[0,1,2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-gray-800" />)}</div> : projects.length === 0 ? <p className="text-sm text-gray-500">{providerError('github') ? 'GitHub repositories are unavailable right now.' : 'No public repositories found.'}</p> : <div className="space-y-3">{projects.map((repo) => <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-gray-800 p-4 transition hover:border-cyan-400/50"><div className="flex items-center justify-between gap-3"><span className="font-medium text-cyan-200">{repo.name}</span><ExternalLink size={14} className="shrink-0 text-gray-500"/></div><p className="mt-1 line-clamp-2 text-sm text-gray-400">{repo.description || 'No description provided.'}</p><p className="mt-3 text-xs text-gray-500">{repo.language || 'Language not specified'} · ★ {repo.stars} · Forks {repo.forks}</p></a>)}</div>}</section>
        <section className={panelStyle}><h3 className="mb-5 font-semibold text-white">Recent accepted submissions</h3>{loading ? <div className="space-y-3">{[0,1,2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-gray-800" />)}</div> : <div className="space-y-3">{[...(cf?.recentAccepted ?? []).map((item) => ({ ...item, platform: 'Codeforces' })), ...(lc?.recentAccepted ?? []).map((item) => ({ ...item, platform: 'LeetCode' }))].sort((a, b) => b.date - a.date).slice(0, 8).map((item) => <a key={`${item.platform}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-gray-800 p-3 hover:border-cyan-400/50"><span className="min-w-0"><span className="block truncate text-sm text-gray-200">{item.name}</span><span className="text-xs text-gray-500">{item.platform}{'rating' in item && item.rating ? ` · ${item.rating}` : 'difficulty' in item && item.difficulty ? ` · ${item.difficulty}` : ''}</span></span><ExternalLink size={14} className="shrink-0 text-gray-500"/></a>)}{!cf?.recentAccepted.length && !lc?.recentAccepted.length && <p className="text-sm text-gray-500">Recent submissions are unavailable.</p>}</div>}</section>
      </div>

      <div className="grid gap-4 md:grid-cols-3"><ProfileCard title="GitHub" description={stats?.github.data?.profile.bio ?? 'Public repositories and activity'} href={profileLinks.github} image={stats?.github.data?.profile.avatarUrl} loading={loading} unavailable={providerError('github')}/><ProfileCard title="Codeforces" description={cf?.profile.rank ? `Current rank: ${cf.profile.rank}` : 'Competitive programming profile'} href={profileLinks.codeforces} loading={loading} unavailable={providerError('codeforces')}/>{stats?.leetcode.status !== 'not_configured' && <ProfileCard title="LeetCode" description={lc ? `${formatter.format(lc.totalSolved)} problems solved` : 'LeetCode statistics are temporarily unavailable'} href={profileLinks.leetcode} loading={loading} unavailable={!lc}/>}</div>
      <p className="mt-6 text-right text-xs text-gray-600">{stats?.generatedAt ? `Updated ${new Date(stats.generatedAt).toLocaleString()}` : 'Loading platform data'} · LeetCode data depends on an unofficial endpoint.</p>
    </div>
  </section>
}

function ProfileCard({ title, description, href, image, loading, unavailable }: { title: string; description: string; href: string; image?: string; loading: boolean; unavailable: boolean }) {
  return <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-[#12121b] p-5 hover:border-cyan-400/50"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-800">{image && !unavailable ? <img src={image} alt="GitHub profile avatar" className="h-full w-full object-cover"/> : <Github size={20} className="text-gray-400"/>}</div><div className="min-w-0"><h3 className="font-semibold">{title}</h3><p className="mt-1 truncate text-sm text-gray-400">{loading ? 'Loading profile…' : unavailable ? 'Profile data unavailable' : description}</p></div><ExternalLink size={14} className="ml-auto shrink-0 text-gray-500"/></a>
}
