import { ArrowUpRight, Landmark, GraduationCap, Sparkles } from 'lucide-react'

const projects = [
  {
    title: 'Vibranium',
    category: 'AI startup success predictor',
    description: 'AI-powered startup idea analysis and recommendations.',
    image: '/project-covers/vibranium.png',
    href: 'https://vibranium0-vibranium-ai-success-predictor.hf.space',
    tone: 'violet',
  },
  {
    title: 'P2Pay',
    category: 'Bank management system',
    description: 'A Python banking application for account and transaction management.',
    href: 'https://p2pay-banking-portal.onrender.com/',
    tone: 'cyan',
  },
  {
    title: 'Student Management',
    category: 'Student record system',
    description: 'A menu-driven student record manager with CRUD operations.',
    href: 'https://student-management-system-abyw.onrender.com/',
    tone: 'amber',
  },
] as const

function ProjectCard({ project, duplicate = false }: { project: (typeof projects)[number]; duplicate?: boolean }) {
  const ArtIcon = project.tone === 'cyan' ? Landmark : project.tone === 'amber' ? GraduationCap : Sparkles

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noreferrer"
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      className="project-marquee-card group relative w-[min(78vw,350px)] shrink-0 rounded-[26px] border border-white/[0.08] bg-[#111116] p-2.5 transition-colors hover:border-cyan-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[19px] bg-[#17171e]">
        {'image' in project ? (
          <img src={project.image} alt={`${project.title} project preview`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className={`project-art project-art-${project.tone} flex h-full items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
            <div className="relative flex flex-col items-center gap-4 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-[24px] border border-white/15 bg-black/20 text-white shadow-2xl backdrop-blur-sm">
                <ArtIcon size={38} strokeWidth={1.4} aria-hidden="true" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">{project.title}</span>
            </div>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/80 backdrop-blur">{project.category}</span>
      </div>
      <div className="flex items-start justify-between gap-4 px-3 pb-3 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{project.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-400">{project.description}</p>
        </div>
        <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-gray-400 transition group-hover:border-cyan-300/40 group-hover:text-cyan-200">
          <ArrowUpRight size={17} aria-hidden="true" />
        </span>
      </div>
    </a>
  )
}

export function ProjectMarquee() {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="overflow-hidden border-t border-gray-900 py-16 sm:py-20">
      <div className="mx-auto mb-9 flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 sm:px-8">
        <div>
          <p className="mb-2 font-mono text-xs tracking-[0.18em] text-cyan-400">SELECTED WORK</p>
          <h2 id="projects-heading" className="text-3xl font-bold sm:text-4xl">Projects</h2>
          <p className="mt-3 max-w-2xl text-gray-400">A few things I’ve built. Select a card to open the project.</p>
        </div>
        <a href="https://github.com/p2the28?tab=repositories" target="_blank" rel="noreferrer" className="text-sm text-cyan-300 transition hover:text-cyan-200">Browse all projects ↗</a>
      </div>

      <div className="project-marquee relative py-5" aria-label="Project gallery moving from right to left">
        <div className="project-marquee-track">
          <div className="project-marquee-group" aria-label="Projects">
            {projects.map((project) => <ProjectCard key={project.title} project={project} />)}
          </div>
          <div className="project-marquee-group" aria-hidden="true">
            {projects.map((project) => <ProjectCard key={project.title} project={project} duplicate />)}
          </div>
        </div>
      </div>
    </section>
  )
}
