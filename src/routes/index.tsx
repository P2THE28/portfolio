import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowRight, ChevronDown, Mail, Menu, Moon, Sun, X } from 'lucide-react'
import { CodingDashboard } from '@/components/CodingDashboard'
import { ProjectMarquee } from '@/components/ProjectMarquee'
import { PlatformIcon, type Platform } from '@/components/PlatformIcon'
import { HexGlowBackground } from '@/components/HexGlowBackground'
import TechText from '@/components/TechText.jsx'
import { profileConfig, profileLinks } from '@/lib/profile-config'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Coding Stats', href: '#coding-stats' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false)
    if (href === '#contact') {
      event.preventDefault()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (window.location.hash === '#contact') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
      window.scrollTo(0, 0)
    }
    try {
      const savedTheme = window.localStorage.getItem('portfolio-theme')
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme)
    } catch { /* Keep the default theme when storage is unavailable. */ }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { window.localStorage.setItem('portfolio-theme', theme) } catch { /* Theme switching still works for this page. */ }
  }, [theme])

  return (
    <main className="portfolio-shell min-h-screen overflow-x-hidden">
      <HexGlowBackground />
      <nav className="portfolio-nav sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3.5 sm:px-8">
          <a href="#home" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-white" aria-label="Priyanshu Kumar, home"><span className="font-mono text-xl text-cyan-400">&lt;/&gt;</span><span className="hidden sm:inline">Priyanshu Kumar</span><span className="sm:hidden">p2the28</span></a>
          <div className="ml-auto hidden items-center gap-6 text-sm text-gray-400 lg:flex">
            {navigationLinks.map(({ label, href }) => <a key={href} href={href} onClick={(event) => handleNavigation(event, href)} className="whitespace-nowrap transition hover:text-cyan-300">{label}</a>)}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ml-0">
            <button type="button" onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to midnight theme'} className="grid h-9 w-9 place-items-center rounded-lg text-violet-300 transition hover:bg-white/5 hover:text-cyan-300">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</button>
            <a href={profileConfig.resumeUrl} download aria-label="Download resume" className="inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-400/50 px-2.5 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/10 sm:px-4 sm:text-sm"><span className="hidden sm:inline">Resume</span><ArrowDownToLine size={14} /></a>
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" className="grid h-9 w-9 place-items-center rounded-lg text-gray-300 transition hover:bg-white/5 hover:text-cyan-300 lg:hidden">{mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>
        {mobileMenuOpen && <div id="mobile-navigation" className="border-t border-[var(--border-color)] px-5 py-3 lg:hidden sm:px-8"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-1">{navigationLinks.map(({ label, href }) => <a key={href} href={href} onClick={(event) => handleNavigation(event, href)} className="rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-cyan-300">{label}</a>)}</div></div>}
      </nav>

      <section id="home" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[620px] lg:grid-cols-[1.15fr_.85fr] lg:py-10">
        <div id="about" className="relative z-10 w-full text-left">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-cyan-200">COMPUTER SCIENCE · NIT ROURKELA</p>
          <h1 className="max-w-full text-3xl font-bold leading-[1.12] tracking-tight text-[var(--text-primary)] sm:text-5xl">
            <span className="block">Hi, I’m</span>
            <span className="block w-full">
              <TechText
                text="Priyanshu Kumar"
                fontSize={150}
                fontWeight={700}
                color={theme === 'dark' ? '#84c8ff' : '#1673bf'}
                accentColor={theme === 'dark' ? '#42dcf5' : '#0891b2'}
                gradient
                letterSpacing={-0.025}
                align="left"
                intro="type"
                introDuration={1.15}
                labels={false}
                selection={false}
                draggable={false}
                reveal="none"
                sweep={false}
                clickKick={false}
                className="block h-[1.15em] w-full"
              />
            </span>
          </h1>
          <p className="mt-3 text-lg font-medium text-gray-200 sm:text-xl">Computer Science & Engineering student · Developer</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">I’m a CSE student at NIT Rourkela who enjoys solving challenging problems, building meaningful software, and exploring new technologies. Currently focused on C++, Data Structures and Algorithms, competitive programming, and full-stack development.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#projects" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">View my projects <ArrowRight size={16} /></a>
            <a href="#contact" onClick={(event) => { event.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/50 px-5 py-3 text-sm font-medium text-gray-200 transition hover:bg-violet-300/10">Contact me <ArrowRight size={15} /></a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-2.5" aria-label="Social profiles">
            {Object.entries(profileLinks).filter(([name]) => ['github', 'codeforces', 'leetcode'].includes(name)).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={`Open ${name} profile`} title={name} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-gray-300 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"><PlatformIcon platform={name as Platform} size={18} /></a>)}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md pt-3">
          <div className="absolute -inset-3 rounded-[32px] border border-cyan-300/10" />
          <div className="theme-card relative z-10 overflow-hidden rounded-[28px] border border-[var(--border-color)] bg-[var(--card-bg)] p-2.5 shadow-2xl shadow-cyan-950/20">
            <img src="/profile-photo.jpg" alt="Priyanshu Kumar" className="aspect-square w-full rounded-[21px] object-cover object-[center_38%]" />
            <div className="flex items-center justify-between gap-4 px-3 py-3.5"><div><p className="text-sm font-semibold text-white">Priyanshu Kumar</p><p className="mt-0.5 text-xs text-gray-400">NIT Rourkela · CSE</p></div><span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-[11px] text-cyan-200"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Building & learning</span></div>
          </div>
          <section aria-labelledby="about-me-heading" className="theme-card relative z-0 -mt-3 rounded-[24px] border border-[var(--border-color)] bg-[var(--card-bg)] px-5 pb-5 pt-6 shadow-xl shadow-violet-950/10">
            <button type="button" aria-expanded={aboutOpen} aria-controls="about-me-content" onClick={() => setAboutOpen((open) => !open)} className="flex w-full items-center justify-between gap-4 text-left">
              <span>
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.18em] text-violet-300">A LITTLE ABOUT ME</p>
              <h2 id="about-me-heading" className="text-xl font-semibold tracking-tight text-white">About Me</h2>
              </span>
              <ChevronDown size={18} className={`shrink-0 text-violet-300 transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`} />
            </button>
            <div id="about-me-content" hidden={!aboutOpen} className="mt-3 border-t border-[var(--border-color)] pt-4">
              <div className="mt-3 space-y-3 text-sm leading-6 text-gray-400">
                <p>I’m a Computer Science and Engineering student at NIT Rourkela with a strong interest in problem-solving, software engineering, and emerging technologies.</p>
                <p>I enjoy solving Data Structures and Algorithms problems using C++, participating in competitive programming, and building practical projects that turn ideas into working solutions. I’m continuously strengthening my understanding of algorithms, backend development, and modern web technologies while exploring the possibilities of AI and machine learning.</p>
                <p>Beyond coding, I enjoy photography and creative work, which help me approach problems from different perspectives. I believe in learning by building, improving through consistency, and writing software that is useful, reliable, and well-engineered.</p>
              </div>
              <p className="mt-4 rounded-xl border border-violet-300/15 bg-violet-300/[0.04] px-3 py-2.5 text-xs leading-5 text-gray-300"><span className="font-semibold text-violet-300">Currently focused on:</span> Competitive Programming, Full-Stack Development, and AI/ML.</p>
            </div>
          </section>
        </div>
      </section>

      <CodingDashboard />

      <section id="skills" aria-labelledby="skills-heading" className="border-b border-[var(--border-color)] py-14 sm:py-18">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-8"><p className="mb-2 font-mono text-xs tracking-[0.18em] text-violet-300">TOOLKIT</p><h2 id="skills-heading" className="text-3xl font-semibold tracking-tight text-white">Technical skills</h2><p className="mt-2 text-sm text-gray-400">Grouped by how I use them to build and solve problems.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {skillGroups.map((group) => <section key={group.title} className="theme-card rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5"><h3 className="text-sm font-semibold text-white">{group.title}</h3><ul className="mt-4 flex flex-wrap gap-2">{group.items.map((item) => <li key={item} className="rounded-full border border-[var(--border-color)] px-2.5 py-1 text-xs text-gray-300">{item}</li>)}</ul></section>)}
          </div>
        </div>
      </section>

      <ProjectMarquee />

      <footer id="contact" className="scroll-mt-24 border-t border-[var(--border-color)] py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-2 font-mono text-xs tracking-[0.18em] text-violet-300">LET’S CONNECT</p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Contact me</h2>
            <a href={`mailto:${profileConfig.email}`} aria-label="Email Priyanshu" title="Email Priyanshu" className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-cyan-300 transition hover:border-cyan-400/60 hover:text-cyan-200"><Mail size={18} /></a>
            <div className="mt-4 flex items-center gap-2.5" aria-label="Social profiles">
              {(['linkedin', 'instagram', 'x'] as const).map((name) => <a key={name} href={profileLinks[name]} target="_blank" rel="noreferrer" aria-label={`Open ${name} profile`} title={name} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-gray-300 transition hover:-translate-y-0.5 hover:border-cyan-400/60 hover:text-cyan-300"><PlatformIcon platform={name} size={18} /></a>)}
            </div>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400"><a href="#home" className="hover:text-cyan-300">Home</a><a href="#projects" className="hover:text-cyan-300">Projects</a><a href="#coding-stats" className="hover:text-cyan-300">Coding Stats</a></nav>
        </div>
        <p className="mt-9 text-center text-xs text-gray-500">Made with <span role="img" aria-label="love">❤️</span></p>
      </footer>
    </main>
  )
}

const skillGroups = [
  { title: 'Languages', items: ['C++', 'Python', 'JavaScript', 'TypeScript'] },
  { title: 'Frontend', items: ['React', 'HTML5', 'CSS3', 'Tailwind CSS'] },
  { title: 'Backend', items: ['Flask', 'Firebase Auth', 'Cloud Firestore'] },
  { title: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Jupyter', 'Docker', 'Netlify'] },
  { title: 'CS fundamentals', items: ['Data Structures', 'Algorithms', 'OOP', 'CRUD', 'Validation'] },
]
