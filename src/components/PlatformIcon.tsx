import { Github, Linkedin } from 'lucide-react'

export type Platform = 'github' | 'leetcode' | 'codeforces' | 'linkedin'

export function PlatformIcon({ platform, size = 20 }: { platform: Platform; size?: number }) {
  if (platform === 'github') return <Github size={size} aria-hidden="true" />
  if (platform === 'linkedin') return <Linkedin size={size} aria-hidden="true" />

  if (platform === 'leetcode') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14.5 3.5 8 10l6.5 6.5M8.5 10H21M8.5 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m6 6-3 6 3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h9l-3 3H1l3-3Zm7 7h9l-3 3h-9l3-3Zm2-9h9l-3 3h-9l3-3Zm-2 11h9l-3 3h-9l3-3Z" fill="currentColor" />
  </svg>
}
