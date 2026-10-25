import { createFileRoute } from '@tanstack/react-router'
import { ArrowDownToLine, ExternalLink, Github, Linkedin } from 'lucide-react'

export const Route = createFileRoute('/resume')({
  component: App,
})

function App() {
  const links = [
    { label: 'GitHub', href: 'https://github.com/p2the28', icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/p2the28/', icon: Linkedin },
    { label: 'Codeforces', href: 'https://codeforces.com/profile/p2the28' },
    { label: 'LeetCode', href: 'https://leetcode.com/p2the28' },
    { label: 'CodeChef', href: 'https://www.codechef.com/users/p2the285' },
  ]

  const projects = [
    {
      title: 'Vibranium — AI Startup Success Predictor',
      description: 'AI-powered startup idea evaluation with generated analysis reports, Firebase authentication and storage, and Docker deployment.',
      stack: 'Python, Flask, Google Gemini API, Firebase, Firestore, HTML, CSS, JavaScript, Docker',
      demo: 'https://vibranium0-vibranium-ai-success-predictor.hf.space',
      source: 'https://github.com/Vibranium00/AiSuccessPredictor',
    },
    {
      title: 'Bank Management System (P2Pay)',
      description: 'Object-oriented banking application with account creation and maintenance, transactions, persistent file storage, validation, and exception handling.',
      stack: 'Python, OOP, File Handling',
      demo: 'https://p2pay-banking-portal.onrender.com/',
      source: 'https://github.com/p2the28/P2Pay-Banking-Portal',
    },
    {
      title: 'Student Management System',
      description: 'Menu-driven student record manager with CRUD operations, persistent file storage, and input validation.',
      stack: 'Python, OOP, File Handling',
      demo: 'https://student-management-system-abyw.onrender.com/',
      source: 'https://github.com/p2the28/Student-Management-System',
    },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-5 py-12 text-white sm:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-5 border-b border-white/10 pb-8">
          <p className="font-mono text-sm text-cyan-400">RESUME / 2026</p>
          <h1 className="text-4xl font-bold sm:text-5xl">Priyanshu Kumar</h1>
          <p className="text-lg text-gray-300">Computer Science and Engineering student at NIT Rourkela</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
            <a className="hover:text-cyan-300" href="mailto:priyanshuask528@gmail.com">priyanshuask528@gmail.com</a>
            <a className="hover:text-cyan-300" href="mailto:125cs0018@nitrkl.ac.in">125cs0018@nitrkl.ac.in</a>
            <a className="hover:text-cyan-300" href="tel:+917667550686">+91 76675 50686</a>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {links.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400/60 hover:text-cyan-300">
                {Icon && <Icon size={15} />}{label}<ExternalLink size={13} />
              </a>
            ))}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Education</h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">National Institute of Technology, Rourkela</h3><span className="text-sm text-gray-400">2025–2029</span></div>
            <p className="mt-1 text-gray-300">B.Tech, Computer Science and Engineering · 2nd Year · CGPA: 8.25</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold">PVSS DAV Public School, Jhumri Telaiya</h3><p className="mt-1 text-gray-300">CBSE Intermediate · 2024 · 91.2%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-semibold">Meridian Academy, Jhumri Telaiya</h3><p className="mt-1 text-gray-300">CBSE Secondary · 2022 · 91.4%</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Experience</h2>
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">Technical Member · APS-Club</h3><span className="text-sm text-gray-400">NIT Rourkela</span></div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-300"><li>Participate in competitive programming activities.</li><li>Collaborate with peers on algorithmic problem solving.</li></ul>
          </article>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Personal Projects</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <article key={project.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-semibold">{project.title}</h3><p className="mt-2 text-gray-300">{project.description}</p>
                <p className="mt-3 text-sm text-gray-400"><span className="text-gray-300">Tech:</span> {project.stack}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm"><a className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200" href={project.demo} target="_blank" rel="noreferrer">Live demo <ExternalLink size={14} /></a><a className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200" href={project.source} target="_blank" rel="noreferrer"><Github size={14} />Source code <ExternalLink size={14} /></a></div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Technical Skills</h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-gray-300">
            <p><strong className="text-white">Languages:</strong> C++, Python, HTML5, CSS3</p><p className="mt-2"><strong className="text-white">Frameworks:</strong> Flask</p><p className="mt-2"><strong className="text-white">Developer tools:</strong> Git, GitHub, Visual Studio Code, Jupyter Notebook</p><p className="mt-2"><strong className="text-white">Cloud and databases:</strong> Firebase Authentication, Cloud Firestore, Hugging Face Spaces</p><p className="mt-2"><strong className="text-white">Coursework:</strong> Data Structures and Algorithms, Object-Oriented Programming</p><p className="mt-2"><strong className="text-white">Interests:</strong> Artificial Intelligence, Machine Learning, Competitive Programming, Robotics</p><p className="mt-2"><strong className="text-white">Strengths:</strong> Problem Solving, Teamwork, Communication, Quick Learning, Analytical Thinking</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Competitive Programming</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <a href="https://codeforces.com/profile/p2the28" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/50"><h3 className="font-semibold">Codeforces</h3><p className="mt-1 text-sm text-gray-400">200+ problems · Highest rating 1002</p></a>
            <a href="https://leetcode.com/p2the28" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/50"><h3 className="font-semibold">LeetCode</h3><p className="mt-1 text-sm text-gray-400">60+ problems · Highest rating 1440</p></a>
            <a href="https://www.codechef.com/users/p2the285" target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/50"><h3 className="font-semibold">CodeChef</h3><p className="mt-1 text-sm text-gray-400">20+ problems · Highest rating 1132</p></a>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Download resume</h2><p className="mt-1 text-sm text-gray-400">View or download the original one-page PDF.</p></div><a href="/125CS0018_Priyanshu_Kumar_Resume.pdf" download className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium hover:opacity-90"><ArrowDownToLine size={16} /> Download PDF</a></div>
        </section>
      </div>
    </main>
  )
}
