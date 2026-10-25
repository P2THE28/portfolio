import { createFileRoute } from '@tanstack/react-router'
import { CodingDashboard } from '@/components/CodingDashboard'
import { profileConfig, profileLinks } from '@/lib/profile-config'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a0a0f] text-white">
      <nav className="sticky top-0 z-20 border-b border-gray-800/70 bg-[#0a0a0f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#home" className="font-mono font-bold text-cyan-300">&lt;p2the28 /&gt;</a>
          <div className="flex items-center gap-4 text-sm text-gray-400 sm:gap-6">
            <a href="#coding-stats" className="hover:text-cyan-300">Coding stats</a>
            <a href="#projects" className="hover:text-cyan-300">Projects</a>
            <a href="#contact" className="hover:text-cyan-300">Contact</a>
          </div>
          <a href={profileConfig.resumeUrl} className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 sm:block">Resume</a>
        </div>
      </nav>

      <section id="home" className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_.8fr]">
        <div>
          <p className="mb-5 font-mono text-sm text-cyan-300">COMPUTER SCIENCE · NIT ROURKELA</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">Hi, I’m <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">{profileConfig.name}</span></h1>
          <p className="mt-5 text-xl text-gray-300">{profileConfig.role}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">I enjoy {profileConfig.interests.join(', ').toLowerCase()}, with a focus on building useful software and solving challenging problems.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 font-medium hover:opacity-90">Explore projects</a>
            <a href={`mailto:${profileConfig.email}`} className="rounded-lg border border-gray-700 px-5 py-3 font-medium text-gray-200 hover:border-cyan-400">Contact me</a>
            <a href={profileConfig.resumeUrl} download className="rounded-lg border border-gray-700 px-5 py-3 font-medium text-gray-200 hover:border-cyan-400">Download resume</a>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-400">
            {Object.entries(profileLinks).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="capitalize hover:text-cyan-300">{name} ↗</a>)}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-[#12121b] p-6 font-mono text-sm shadow-2xl shadow-cyan-950/30">
          <p className="text-gray-500">// developer profile</p>
          <pre className="mt-4 whitespace-pre-wrap leading-7"><span className="text-purple-300">const</span> developer = {'{'}{'\n'}  name: <span className="text-green-300">"{profileConfig.name}"</span>,{'\n'}  focus: <span className="text-green-300">"{profileConfig.primaryLanguage}"</span>,{'\n'}  interests: [{profileConfig.interests.slice(0, 2).map((interest) => <span key={interest} className="text-green-300">"{interest}"</span>).reduce((a, b) => <>{a}, {b}</>)}],{'\n'}{'}'}</pre>
        </div>
      </section>

      <CodingDashboard />

      <section id="projects" className="border-t border-gray-900 py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="text-3xl font-bold">Projects</h2>
          <p className="mt-3 max-w-2xl text-gray-400">Recent public repositories are loaded from GitHub in the coding statistics section above.</p>
          <a href={`${profileLinks.github}?tab=repositories`} target="_blank" rel="noreferrer" className="mt-6 inline-block text-cyan-300 hover:text-cyan-200">Browse all repositories ↗</a>
        </div>
      </section>

      <footer id="contact" className="border-t border-gray-900 py-10 text-center text-sm text-gray-500">
        <p>Interested in collaborating or talking tech?</p>
        <a href={`mailto:${profileConfig.email}`} className="mt-2 inline-block text-cyan-300 hover:text-cyan-200">{profileConfig.email}</a>
      </footer>
    </main>
  )
}