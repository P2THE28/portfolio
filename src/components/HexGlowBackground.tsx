import { useEffect, useRef } from 'react'

const HEX_PATH = [
  'M 76 0 L 38 65.81793 L -38 65.81793 L -76 0 L -38 -65.81793 L 38 -65.81793 Z',
  'M 190 65.81793 L 152 131.63586 L 76 131.63586 L 38 65.81793 L 76 0 L 152 0 Z',
  'M 304 0 L 266 65.81793 L 190 65.81793 L 152 0 L 190 -65.81793 L 266 -65.81793 Z',
  'M 76 131.63586 L 38 197.45379 L -38 197.45379 L -76 131.63586 L -38 65.81793 L 38 65.81793 Z',
  'M 304 131.63586 L 266 197.45379 L 190 197.45379 L 152 131.63586 L 190 65.81793 L 266 65.81793 Z',
].join(' ')

export function HexGlowBackground() {
  const rootRef = useRef<SVGSVGElement>(null)
  const pointerPurpleRef = useRef<SVGRadialGradientElement>(null)
  const pointerBlueRef = useRef<SVGRadialGradientElement>(null)

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const root = rootRef.current
      const purple = pointerPurpleRef.current
      const blue = pointerBlueRef.current
      if (!root || !purple || !blue) return
      const bounds = root.getBoundingClientRect()
      const x = `${event.clientX - bounds.left}`
      const y = `${event.clientY - bounds.top}`
      purple.setAttribute('cx', x)
      purple.setAttribute('cy', y)
      blue.setAttribute('cx', x)
      blue.setAttribute('cy', y)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return (
    <svg
      ref={rootRef}
      className="hex-glow-background"
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="portfolio-hex-neon" x1="0" y1="0" x2="228" y2="131.63586" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="48%" stopColor="#5227FF" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
        <pattern id="portfolio-hex-base" width="228" height="131.63586" patternUnits="userSpaceOnUse">
          <path d={HEX_PATH} fill="none" stroke="#303044" strokeWidth="0.8" />
        </pattern>
        <pattern id="portfolio-hex-light" width="228" height="131.63586" patternUnits="userSpaceOnUse">
          <path d={HEX_PATH} fill="none" stroke="url(#portfolio-hex-neon)" strokeWidth="1.2" />
        </pattern>
        <pattern id="portfolio-hex-purple" width="228" height="131.63586" patternUnits="userSpaceOnUse">
          <path d={HEX_PATH} fill="none" stroke="#9333EA" strokeWidth="1.35" />
        </pattern>
        <pattern id="portfolio-hex-blue" width="228" height="131.63586" patternUnits="userSpaceOnUse">
          <path d={HEX_PATH} fill="none" stroke="#2563EB" strokeWidth="1.3" />
        </pattern>
        <radialGradient ref={pointerPurpleRef} id="portfolio-hex-focus-purple" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="190">
          <stop offset="0%" stopColor="white" stopOpacity="0.98" />
          <stop offset="28%" stopColor="white" stopOpacity="0.78" />
          <stop offset="66%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <radialGradient ref={pointerBlueRef} id="portfolio-hex-focus-blue" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="330">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="32%" stopColor="white" stopOpacity="0.45" />
          <stop offset="64%" stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask id="portfolio-hex-focus-purple-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#portfolio-hex-focus-purple)" />
        </mask>
        <mask id="portfolio-hex-focus-blue-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#portfolio-hex-focus-blue)" />
        </mask>
        <filter id="portfolio-hex-soft-glow" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="2.3" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="#08080C" />
      <rect width="100%" height="100%" fill="url(#portfolio-hex-base)" opacity="0.72" />
      <rect width="100%" height="100%" fill="url(#portfolio-hex-light)" opacity="0.055" />
      <rect
        width="100%"
        height="100%"
        fill="url(#portfolio-hex-blue)"
        mask="url(#portfolio-hex-focus-blue-mask)"
        filter="url(#portfolio-hex-soft-glow)"
        opacity="0.58"
      />
      <rect width="100%" height="100%" fill="url(#portfolio-hex-purple)" mask="url(#portfolio-hex-focus-purple-mask)" filter="url(#portfolio-hex-soft-glow)" opacity="0.75" />
      <rect width="100%" height="100%" fill="url(#portfolio-hex-blue)" mask="url(#portfolio-hex-focus-blue-mask)" opacity="0.52" />
      <rect width="100%" height="100%" fill="url(#portfolio-hex-purple)" mask="url(#portfolio-hex-focus-purple-mask)" opacity="0.72" />
    </svg>
  )
}
