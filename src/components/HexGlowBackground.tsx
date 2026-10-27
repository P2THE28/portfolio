import { useEffect, useRef } from 'react'

type TrailPoint = { x: number; y: number; time: number }
type Cell = { x: number; y: number }

// Violet preset values from the supplied background animation reference.
const PRESET = {
  cellSize: 1.9,
  lineWidth: 0.5,
  litWidth: 1.8,
  glow: 1.5,
  glowRadius: 0.5,
  lattice: 0.4,
  core: 0.4,
  vignette: 0,
  grain: 1,
  trailLengthMs: 3_000,
  trailWidth: 1,
  follow: 0.5,
  flow: 0.5,
  shimmer: 1,
  autoplay: true,
  interactive: true,
  clickPulses: true,
  speed: 1,
} as const
const FRAME_INTERVAL_MS = 1000 / 30

function rgba(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((part) => part + part).join('') : value
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function HexGlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const trail: TrailPoint[] = []
    const pulses: TrailPoint[] = []
    let cells: Cell[] = []
    let radius = 64
    let tileHeight = radius * Math.sqrt(3)
    let width = 0
    let height = 0
    let pixelRatio = 1
    let animationFrame = 0
    let lastFrame = 0
    let cool = '#5227ff'
    let hot = '#ff9ffc'
    let lineAlpha = 0.22
    let noisePattern: CanvasPattern | null = null
    let pointerPosition: { x: number; y: number } | null = null

    const buildNoise = () => {
      const texture = document.createElement('canvas')
      texture.width = 128
      texture.height = 128
      const textureContext = texture.getContext('2d')
      if (!textureContext) return
      const pixels = textureContext.createImageData(texture.width, texture.height)
      for (let index = 0; index < pixels.data.length; index += 4) {
        const grain = Math.floor(Math.random() * 256)
        pixels.data[index] = grain
        pixels.data[index + 1] = grain
        pixels.data[index + 2] = grain
        pixels.data[index + 3] = 9
      }
      textureContext.putImageData(pixels, 0, 0)
      noisePattern = context.createPattern(texture, 'repeat')
    }

    const readTheme = () => {
      const root = getComputedStyle(document.documentElement)
      cool = root.getPropertyValue('--hex-cool').trim() || '#5227ff'
      hot = root.getPropertyValue('--hex-hot').trim() || '#ff9ffc'
      lineAlpha = Number.parseFloat(root.getPropertyValue('--hex-line-alpha')) || PRESET.lattice * 0.5
    }

    const makeCells = () => {
      const horizontalStep = radius * 1.5
      const columns = Math.ceil(width / horizontalStep) + 2
      const rows = Math.ceil(height / tileHeight) + 2
      cells = []
      for (let column = -1; column < columns; column += 1) {
        const x = column * horizontalStep
        const offsetY = Math.abs(column % 2) * tileHeight / 2
        for (let row = -1; row < rows; row += 1) {
          cells.push({ x, y: row * tileHeight + offsetY })
        }
      }
    }

    const draw = (now: number, withGlow: boolean) => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineWidth = PRESET.lineWidth
      context.strokeStyle = rgba(cool, lineAlpha)
      context.beginPath()
      for (const cell of cells) {
        for (let side = 0; side < 6; side += 1) {
          const angle = Math.PI / 3 * side
          const nextAngle = Math.PI / 3 * (side + 1)
          context.moveTo(cell.x + radius * Math.cos(angle), cell.y + radius * Math.sin(angle))
          context.lineTo(cell.x + radius * Math.cos(nextAngle), cell.y + radius * Math.sin(nextAngle))
        }
      }
      context.stroke()

      if (noisePattern) {
        context.globalAlpha = 0.48 * PRESET.grain
        context.fillStyle = noisePattern
        context.fillRect(0, 0, width, height)
        context.globalAlpha = 1
      }
      if (PRESET.vignette > 0) {
        const vignette = context.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.8)
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
        vignette.addColorStop(1, `rgba(0, 0, 0, ${PRESET.vignette})`)
        context.fillStyle = vignette
        context.fillRect(0, 0, width, height)
      }

      if (!withGlow) return

      const samples: Array<TrailPoint & { strength: number }> = []
      for (let index = trail.length - 1; index >= 0; index -= 1) {
        const point = trail[index]
        const age = now - point.time
        if (age > PRESET.trailLengthMs) break
        samples.push({
          ...point,
          strength: Math.pow(1 - age / PRESET.trailLengthMs, 1.35) * PRESET.flow * PRESET.trailWidth,
        })
      }
      for (const pulse of pulses) {
        const age = now - pulse.time
        if (age <= 700) samples.push({ ...pulse, strength: (1 - age / 700) * 0.9 })
      }
      if (PRESET.autoplay && !motionPreference.matches) {
        const phase = now / (22_000 / PRESET.speed)
        samples.push({
          x: width * (0.5 + 0.32 * Math.sin(phase)),
          y: height * (0.5 + 0.22 * Math.cos(phase * 0.72)),
          time: now,
          strength: 0.12 + 0.06 * PRESET.shimmer * (0.5 + 0.5 * Math.sin(phase * 2.3)),
        })
      }

      const reachSquared = (radius * (1 + PRESET.glowRadius)) ** 2
      for (const cell of cells) {
        for (let side = 0; side < 6; side += 1) {
          const angle = Math.PI / 3 * side
          const nextAngle = Math.PI / 3 * (side + 1)
          const x1 = cell.x + radius * Math.cos(angle)
          const y1 = cell.y + radius * Math.sin(angle)
          const x2 = cell.x + radius * Math.cos(nextAngle)
          const y2 = cell.y + radius * Math.sin(nextAngle)
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          let strength = 0

          for (const sample of samples) {
            const distanceSquared = (midX - sample.x) ** 2 + (midY - sample.y) ** 2
            if (distanceSquared > reachSquared) continue
            const falloff = Math.exp(-distanceSquared / (radius * radius * PRESET.glowRadius))
            const coreBoost = 1 - PRESET.core + PRESET.core * falloff
            strength = Math.max(strength, falloff * sample.strength * coreBoost)
          }

          if (strength < 0.035) continue
          context.beginPath()
          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
          context.strokeStyle = rgba(hot, Math.min(0.96, strength * PRESET.glow))
          context.lineWidth = PRESET.lineWidth + strength * (PRESET.litWidth - PRESET.lineWidth)
          context.shadowColor = hot
          context.shadowBlur = 13 * strength * PRESET.glow
          context.stroke()
        }
      }
      context.shadowBlur = 0
    }

    const animate = (now: number) => {
      if (now - lastFrame < FRAME_INTERVAL_MS) {
        animationFrame = window.requestAnimationFrame(animate)
        return
      }
      lastFrame = now
      while (trail.length && now - trail[0].time > PRESET.trailLengthMs) trail.shift()
      while (pulses.length && now - pulses[0].time > 700) pulses.shift()
      draw(now, true)
      if ((PRESET.autoplay && !motionPreference.matches) || trail.length || pulses.length) {
        animationFrame = window.requestAnimationFrame(animate)
      }
      else animationFrame = 0
    }

    const scheduleGlow = () => {
      if (motionPreference.matches || animationFrame) return
      animationFrame = window.requestAnimationFrame(animate)
    }

    const handlePointer = (event: PointerEvent) => {
      if (motionPreference.matches || !PRESET.interactive) return
      const now = performance.now()
      if (!pointerPosition) pointerPosition = { x: event.clientX, y: event.clientY }
      pointerPosition.x += (event.clientX - pointerPosition.x) * PRESET.follow
      pointerPosition.y += (event.clientY - pointerPosition.y) * PRESET.follow
      const previous = trail[trail.length - 1]
      if (!previous || now - previous.time > 10 || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 3) {
        trail.push({ x: pointerPosition.x, y: pointerPosition.y, time: now })
      }
      scheduleGlow()
    }

    const handleClickPulse = (event: PointerEvent) => {
      if (motionPreference.matches || !PRESET.clickPulses) return
      pulses.push({ x: event.clientX, y: event.clientY, time: performance.now() })
      scheduleGlow()
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      radius = PRESET.cellSize * 40
      tileHeight = radius * Math.sqrt(3)
      readTheme()
      makeCells()
      draw(performance.now(), false)
    }

    const handleMotionPreference = () => {
      trail.length = 0
      pulses.length = 0
      pointerPosition = null
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      draw(performance.now(), false)
      if (!motionPreference.matches && PRESET.autoplay) scheduleGlow()
    }

    const themeObserver = new MutationObserver(() => {
      readTheme()
      draw(performance.now(), !motionPreference.matches && trail.length > 0)
    })
    buildNoise()
    resize()
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointer, { passive: true })
    window.addEventListener('pointerdown', handleClickPulse, { passive: true })
    motionPreference.addEventListener('change', handleMotionPreference)
    if (!motionPreference.matches && PRESET.autoplay) scheduleGlow()

    return () => {
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerdown', handleClickPulse)
      motionPreference.removeEventListener('change', handleMotionPreference)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="hex-glow-background" aria-hidden="true" />
}
