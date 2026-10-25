import { Github } from 'lucide-react'

export type Platform = 'github' | 'leetcode' | 'codeforces' | 'linkedin' | 'x' | 'instagram'

export function PlatformIcon({ platform, size = 20 }: { platform: Platform; size?: number }) {
  if (platform === 'github') return <Github size={size} aria-hidden="true" />
  if (platform === 'linkedin') return <img src="/icons/linkedin.png" width={size} height={size} alt="" aria-hidden="true" className="rounded-[3px] object-contain" />
  if (platform === 'x' || platform === 'instagram') return <img src={`/icons/${platform}.png`} width={size} height={size} alt="" aria-hidden="true" className="rounded-[3px] object-contain" />
  if (platform === 'leetcode' || platform === 'codeforces') return <img src={`/icons/${platform}.png`} width={size} height={size} alt="" aria-hidden="true" className="object-contain" />

  return null
}
