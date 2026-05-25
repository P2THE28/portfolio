import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

const TYPING_TEXTS = [
  'Software Developer',
  'Problem Solver',
  'AI Enthusiast',
  'Competitive Programmer',
  'Full Stack Developer',
]

function useTypingEffect(texts: string[], speed = 80, pause = 1500) {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = texts[textIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < current.length) {
          setDisplayText(current.slice(0, charIndex + 1))
          setCharIndex(c => c + 1)
        } else {
          setTimeout(() => setIsDeleting(true), pause)
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(current.slice(0, charIndex - 1))
          setCharIndex(c => c - 1)
        } else {
          setIsDeleting(false)
          setTextIndex(i => (i + 1) % texts.length)
        }
      }
    }, isDeleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, textIndex, texts, speed, pause])

  return displayText
}

const SKILLS = {
  'Programming Languages': [
    { name: 'C++', level: 85, icon: '⚡' },
    { name: 'Python', level: 80, icon: '🐍' },
    { name: 'JavaScript', level: 75, icon: '🌐' },
  ],
  'Web Development': [
    { name: 'React', level: 78, icon: '⚛️' },
    { name: 'HTML/CSS', level: 85, icon: '🎨' },
    { name: 'Flask', level: 70, icon: '🔥' },
  ],
  'Tools & Platforms': [
    { name: 'Git & GitHub', level: 82, icon: '🔧' },
    { name: 'Firebase', level: 72, icon: '☁️' },
    { name: 'VS Code', level: 90, icon: '💻' },
  ],
}

const PROJECTS = [
  {
    title: 'AI Resume Assistant',
    description: 'Intelligent portfolio with Claude AI that answers questions about experience and skills using natural language processing.',
    tags: ['React', 'TanStack', 'AI', 'TypeScript', 'Netlify'],
    github: 'https://github.com/p2the28',
    live: 'https://p2the28.netlify.app',
    gradient: 'from-blue-500/20 to-purple-500/20',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
  },
  {
    title: 'Smart Task Manager',
    description: 'Productivity app with AI-powered task categorization, priority suggestions, and real-time Firebase collaboration.',
    tags: ['React', 'Firebase', 'JavaScript', 'CSS'],
    github: 'https://github.com/p2the28',
    live: '#',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
  },
  {
    title: 'Competitive Programming Tracker',
    description: 'Dashboard aggregating coding stats from LeetCode and Codeforces with visual analytics and smart recommendations.',
    tags: ['Python', 'Flask', 'JavaScript', 'Chart.js'],
    github: 'https://github.com/p2the28',
    live: '#',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
  },
]

const ACHIEVEMENTS = [
  { platform: 'LeetCode', stat: '300+', desc: 'Problems Solved', color: 'text-yellow-400', bg: 'from-yellow-500/10 to-orange-500/10', border: 'border-yellow-500/30', icon: '🏆' },
  { platform: 'Codeforces', stat: '1200+', desc: 'Rating', color: 'text-blue-400', bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/30', icon: '⚔️' },
  { platform: 'GitHub', stat: '50+', desc: 'Repositories', color: 'text-green-400', bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/30', icon: '🐙' },
  { platform: 'Hackathons', stat: '5+', desc: 'Participated', color: 'text-purple-400', bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/30', icon: '🚀' },
]

const SOCIAL_LINKS = [
  { name: 'GitHub', url: 'https://github.com/p2the28', icon: 'GH', color: 'hover:text-white hover:border-white' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/p2the28', icon: 'LI', color: 'hover:text-blue-400 hover:border-blue-400' },
  { name: 'LeetCode', url: 'https://leetcode.com/p2the28', icon: 'LC', color: 'hover:text-yellow-400 hover:border-yellow-400' },
  { name: 'Codeforces', url: 'https://codeforces.com/profile/p2the28', icon: 'CF', color: 'hover:text-red-400 hover:border-red-400' },
  { name: 'Twitter', url: 'https://twitter.com/p2the28', icon: 'TW', color: 'hover:text-sky-400 hover:border-sky-400' },
  { name: 'Instagram', url: 'https://instagram.com/p2the28', icon: 'IG', color: 'hover:text-pink-400 hover:border-pink-400' },
]

const CODE_LINES = [
  'const developer = {',
  '  name: "Priyanshu Kumar",',
  '  skills: ["C++", "Python", "React"],',
  '  passion: "Building cool things",',
  '  coffee: Infinity,',
  '};',
  '',
  'while (true) {',
  '  developer.learn();',
  '  developer.build();',
  '  developer.innovate();',
  '}',
]

function AnimatedProgressBar({ level, color = 'from-blue-500 to-purple-500' }: { level: number, color?: string }) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWidth(level) },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [level])

  return (
    <div ref={ref} className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      }}
      className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm font-medium"
    >
      {children}
    </a>
  )
}

function Home() {
  const typingText = useTypingEffect(TYPING_TEXTS)
  const [scrolled, setScrolled] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('sending')
    await new Promise(r => setTimeout(r, 1500))
    setFormStatus('sent')
    setFormData({ name: '', email: '', message: '' })
    setTimeout(() => setFormStatus('idle'), 3000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-b border-gray-800/50' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-mono text-cyan-400 font-bold text-lg">
            <span className="text-gray-500">&lt;</span>
            p2the28
            <span className="text-gray-500">/&gt;</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#about">About</NavLink>
            <NavLink href="#skills">Skills</NavLink>
            <NavLink href="#projects">Projects</NavLink>
            <NavLink href="#achievements">Achievements</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>
          <a
            href="/resume.pdf"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <span>⬇</span> Resume
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm font-mono mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Available for opportunities
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Priyanshu Kumar
              </span>
            </h1>
            <div className="text-2xl md:text-3xl text-gray-300 font-mono mb-6 h-10">
              <span className="text-cyan-400">&gt;</span>{' '}
              <span>{typingText}</span>
              <span className="animate-pulse text-cyan-400">|</span>
            </div>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
              Crafting elegant solutions to complex problems. Passionate about AI, competitive programming, and building things that make a difference.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <a
                href="#projects"
                onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                View Projects →
              </a>
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium hover:border-cyan-500 hover:text-cyan-400 transition-all"
              >
                Contact Me
              </a>
            </div>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(link => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.name}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-700 rounded-lg text-gray-400 text-xs font-bold font-mono transition-all duration-200 hover:scale-110 ${link.color}`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Code terminal */}
          <div className="hidden md:block relative">
            <div className="bg-[#1a1a2e]/80 border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl shadow-blue-500/10">
              <div className="flex items-center gap-2 px-4 py-3 bg-[#16213e]/80 border-b border-gray-700/50">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="ml-4 text-gray-500 text-xs font-mono">priyanshu.ts</span>
              </div>
              <div className="p-6 font-mono text-sm">
                {CODE_LINES.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="text-gray-600 w-8 text-right mr-4 select-none">{line ? i + 1 : ''}</span>
                    <span className={
                      line.includes('const') || line.includes('while') ? 'text-purple-400' :
                      line.includes('"') || line.includes("'") ? 'text-green-400' :
                      line.includes(':') && !line.includes('//') ? 'text-blue-300' :
                      line.includes('//') ? 'text-gray-500' :
                      'text-gray-300'
                    }>{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl -z-10" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              About <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Me</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative w-64 h-64 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl rotate-6 opacity-20" />
                <div className="relative bg-[#1a1a2e] border border-gray-700/50 rounded-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">👨‍💻</div>
                    <div className="text-gray-400 text-sm font-mono">@p2the28</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                I'm a passionate software developer with a love for solving complex algorithmic problems and building impactful web applications. Currently exploring the intersection of AI and software engineering.
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed">
                When I'm not coding, I enjoy competitive programming on LeetCode and Codeforces, contributing to open source, and capturing moments through photography 📷.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Location', value: 'India 🇮🇳' },
                  { label: 'Status', value: 'Open to Work' },
                  { label: 'Focus', value: 'AI & Web Dev' },
                  { label: 'Hobby', value: 'Photography 📷' },
                ].map(item => (
                  <div key={item.label} className="bg-[#1a1a2e]/60 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                    <div className="text-cyan-400 text-sm font-medium">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tech <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Stack</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(SKILLS).map(([category, skills]) => (
              <div key={category} className="bg-[#1a1a2e]/60 border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <h3 className="text-cyan-400 font-mono text-sm mb-6 font-bold">{`// ${category}`}</h3>
                <div className="space-y-5">
                  {skills.map(skill => (
                    <div key={skill.name}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span>{skill.icon}</span>
                          <span className="text-gray-300 text-sm">{skill.name}</span>
                        </div>
                        <span className="text-gray-500 text-xs font-mono">{skill.level}%</span>
                      </div>
                      <AnimatedProgressBar level={skill.level} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Featured <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Projects</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PROJECTS.map((project, i) => (
              <div
                key={i}
                className={`relative bg-gradient-to-br ${project.gradient} border ${project.border} rounded-xl p-6 hover:shadow-xl ${project.glow} transition-all duration-300 group hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-gray-700/50 rounded-lg flex items-center justify-center text-lg">
                    🗂️
                  </div>
                  <div className="flex gap-3">
                    {project.github !== '#' && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors text-xs font-mono border border-gray-700 hover:border-gray-500 px-2 py-1 rounded">GH</a>
                    )}
                    {project.live !== '#' && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-cyan-400 transition-colors text-xs font-mono border border-gray-700 hover:border-cyan-500 px-2 py-1 rounded">↗</a>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="text-xs font-mono bg-gray-800/60 border border-gray-700/50 text-gray-400 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="https://github.com/p2the28"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-600 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 px-6 py-3 rounded-lg transition-all"
            >
              View all on GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Achievements</span> & Stats
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {ACHIEVEMENTS.map((item, i) => (
              <div key={i} className={`bg-gradient-to-br ${item.bg} border ${item.border} rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className={`text-3xl font-bold ${item.color} mb-1`}>{item.stat}</div>
                <div className="text-gray-400 text-xs">{item.desc}</div>
                <div className="text-gray-600 text-xs mt-1">{item.platform}</div>
              </div>
            ))}
          </div>

          {/* GitHub Stats */}
          <div className="bg-[#1a1a2e]/60 border border-gray-700/50 rounded-xl p-8">
            <h3 className="text-cyan-400 font-mono text-sm mb-6 font-bold">// GitHub Activity</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
              <img
                src="https://github-readme-stats.vercel.app/api?username=p2the28&show_icons=true&theme=tokyonight&hide_border=true&bg_color=1a1a2e&title_color=60a5fa&text_color=9ca3af&icon_color=a78bfa"
                alt="GitHub Stats"
                className="rounded-lg max-w-sm w-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <img
                src="https://github-readme-streak-stats.herokuapp.com/?user=p2the28&theme=tokyonight&hide_border=true&background=1a1a2e&stroke=60a5fa&ring=a78bfa&fire=f59e0b&currStreakNum=60a5fa&sideNums=60a5fa&currStreakLabel=9ca3af&sideLabels=9ca3af&dates=6b7280"
                alt="GitHub Streak"
                className="rounded-lg max-w-sm w-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Let's <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Connect</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6" />
            <p className="text-gray-400 text-lg">Let's build something amazing together 🚀</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-cyan-400 font-mono text-sm mb-6 font-bold">// Get In Touch</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Whether it's a project collaboration, job opportunity, or just a chat about tech — my inbox is always open.
              </p>
              <div className="space-y-4 mb-8">
                <a href="mailto:priyanshu@example.com" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors">
                  <span className="w-8 h-8 bg-[#1a1a2e] border border-gray-700/50 rounded-lg flex items-center justify-center text-sm">📧</span>
                  <span>priyanshu@example.com</span>
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                {SOCIAL_LINKS.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 border border-gray-700/50 text-gray-400 text-xs px-3 py-2 rounded-lg transition-all hover:scale-105 ${link.color}`}
                  >
                    <span className="font-mono font-bold">{link.icon}</span>
                    <span>{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full bg-[#1a1a2e]/60 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full bg-[#1a1a2e]/60 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  required
                  rows={5}
                  className="w-full bg-[#1a1a2e]/60 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {formStatus === 'idle' ? 'Send Message 🚀' : formStatus === 'sending' ? 'Sending...' : 'Message Sent! ✓'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-gray-500 text-sm">
            Built with ❤️ by{' '}
            <span className="text-cyan-400">Priyanshu Kumar</span>
          </div>
          <div className="text-gray-600 text-sm">
            © 2024 p2the28 • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}
