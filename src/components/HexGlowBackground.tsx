import { useEffect, useRef } from 'react'

type Point = { x: number; y: number }
type TimedPoint = Point & { time: number }
type Edge = { x1: number; y1: number; x2: number; y2: number }

// Violet preset shown in the reference customization panel.
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
  speed: 1,
  pulseSpeed: 1,
  pulseWidth: 0.19,
  pulseBrightness: 1.12,
  pulseDecayMs: 1_050,
  autoplay: true,
  interactive: true,
  clickPulses: true,
} as const

const LEVELS = 12
const TAU = Math.PI * 2

function rgba(hex: string, alpha: number) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((part) => part + part).join('') : value
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function mixHex(from: string, to: string, amount: number) {
  const channel = (color: string, index: number) => Number.parseInt(color.replace('#', '').slice(index, index + 2), 16)
  return `#${[0, 2, 4]
    .map((index) => Math.round(channel(from, index) + (channel(to, index) - channel(from, index)) * amount).toString(16).padStart(2, '0'))
    .join('')}`
}

function distanceToSegment(point: Point, edge: Edge) {
  const dx = edge.x2 - edge.x1
  const dy = edge.y2 - edge.y1
  const lengthSquared = dx * dx + dy * dy || 1
  const amount = Math.max(0, Math.min(1, ((point.x - edge.x1) * dx + (point.y - edge.y1) * dy) / lengthSquared))
  return Math.hypot(point.x - (edge.x1 + dx * amount), point.y - (edge.y1 + dy * amount))
}

export function HexGlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const edges: Edge[] = []
    const pointerTrail: TimedPoint[] = []
    const pulses: TimedPoint[] = []
    const levels: Edge[][] = Array.from({ length: LEVELS }, () => [])
    const glowCanvas = document.createElement('canvas')
    const glowContext = glowCanvas.getContext('2d')
    if (!glowContext) return

    let width = 0
    let height = 0
    let pixelRatio = 1
    let radius = 76
    let tileHeight = radius * Math.sqrt(3)
    let raf = 0
    let lastTime = 0
    let cool = '#5227ff'
    let hot = '#ff9ffc'
    let lineAlpha = 0.095
    let noisePattern: CanvasPattern | null = null
    let pointerTarget: Point | null = null
    let pointer: Point | null = null
    let pageVisible = !document.hidden
    let active = true

    const buildNoise = () => {
      const texture = document.createElement('canvas')
      texture.width = 128
      texture.height = 128
      const textureContext = texture.getContext('2d')
      if (!textureContext) return
      const pixels = textureContext.createImageData(texture.width, texture.height)
      let seed = 0
      for (let index = 0; index < pixels.data.length; index += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0
        const grain = seed >>> 24
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
      const parsedAlpha = Number.parseFloat(root.getPropertyValue('--hex-line-alpha'))
      lineAlpha = Number.isFinite(parsedAlpha) ? parsedAlpha * 0.5 : PRESET.lattice * 0.5
    }

    const makeEdges = () => {
      radius = PRESET.cellSize * 40
      tileHeight = radius * Math.sqrt(3)
      const edgeMap = new Map<string, Edge>()
      const horizontalStep = radius * 1.5
      const columns = Math.ceil(width / horizontalStep) + 3
      const rows = Math.ceil(height / tileHeight) + 3
      for (let column = -2; column < columns; column += 1) {
        const centerX = column * horizontalStep
        const offsetY = Math.abs(column % 2) * tileHeight / 2
        for (let row = -2; row < rows; row += 1) {
          const centerY = row * tileHeight + offsetY
          for (let side = 0; side < 6; side += 1) {
            const firstAngle = (TAU / 6) * side
            const secondAngle = (TAU / 6) * (side + 1)
            const x1 = centerX + radius * Math.cos(firstAngle)
            const y1 = centerY + radius * Math.sin(firstAngle)
            const x2 = centerX + radius * Math.cos(secondAngle)
            const y2 = centerY + radius * Math.sin(secondAngle)
            const a = `${Math.round(x1 * 10)},${Math.round(y1 * 10)}`
            const b = `${Math.round(x2 * 10)},${Math.round(y2 * 10)}`
            const key = a < b ? `${a}|${b}` : `${b}|${a}`
            if (!edgeMap.has(key)) edgeMap.set(key, { x1, y1, x2, y2 })
          }
        }
      }
      edges.length = 0
      edges.push(...edgeMap.values())
    }

    const sourceAt = (timeSeconds: number, index: number): Point => {
      const phase = timeSeconds * PRESET.speed
      if (index === 0) {
        return {
          x: width * (0.5 + 0.27 * Math.sin(phase * 0.16) + 0.1 * Math.sin(phase * 0.071 + 1.1)),
          y: height * (0.5 + 0.31 * Math.sin(phase * 0.105 + 0.65) + 0.08 * Math.cos(phase * 0.19)),
        }
      }
      return {
        x: width * (0.5 + 0.32 * Math.sin(phase * 0.103 + 2.4) + 0.07 * Math.cos(phase * 0.058)),
        y: height * (0.5 + 0.27 * Math.cos(phase * 0.133 + 1.7) + 0.09 * Math.sin(phase * 0.079)),
      }
    }

    const rebuildGlow = (now: number) => {
      for (const level of levels) level.length = 0
      const elapsed = now / 1000
      const trailSteps = 9
      const trailStep = PRESET.trailLengthMs / trailSteps
          const pulseLife = PRESET.pulseDecayMs * 2.4
      const sigma = radius * (0.27 + PRESET.glowRadius * 0.32) * (0.8 + PRESET.trailWidth * 0.2)
      const reach = sigma * 2.65
      const sigmaSquared = 2 * sigma * sigma
      for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        const edge = edges[edgeIndex]
        let strength = 0

        if (PRESET.autoplay && !motionPreference.matches) {
          for (let light = 0; light < 2; light += 1) {
            const sourceStrength = light === 0 ? 0.82 : 0.55
            for (let step = 0; step <= trailSteps; step += 1) {
              const age = step * trailStep
              const source = sourceAt(elapsed - age / 1000, light)
              const distance = distanceToSegment(source, edge)
              if (distance > reach) continue
              const fade = Math.pow(1 - age / PRESET.trailLengthMs, 1.55)
              const shimmer = 0.88 + 0.12 * Math.sin((elapsed - age / 1000) * 1.7 + light * 1.8)
              const falloff = Math.exp(-(distance * distance) / sigmaSquared)
              strength = Math.max(strength, falloff * fade * sourceStrength * shimmer * PRESET.flow)
            }
          }
        }

        if (pointer && pointerTarget && !motionPreference.matches && PRESET.interactive) {
          const distance = distanceToSegment(pointer, edge)
          if (distance < radius * 1.4) {
            const cursorGlow = Math.exp(-(distance * distance) / (2 * (radius * 0.46) ** 2)) * 0.72
            strength = Math.max(strength, cursorGlow)
          }
        }

        for (let pulseIndex = 0; pulseIndex < pulses.length; pulseIndex += 1) {
          const pulse = pulses[pulseIndex]
          const age = now - pulse.time
          if (age < 0 || age > pulseLife) continue
          const distance = distanceToSegment(pulse, edge)
          const waveRadius = age * (0.34 + PRESET.pulseSpeed * 0.46)
          const waveWidth = radius * PRESET.pulseWidth
          const wave = Math.exp(-((distance - waveRadius) ** 2) / (2 * waveWidth * waveWidth))
          const fade = Math.exp(-age / PRESET.pulseDecayMs)
          strength = Math.max(strength, wave * fade * PRESET.pulseBrightness)
        }

        for (let trailIndex = 0; trailIndex < pointerTrail.length; trailIndex += 1) {
          const point = pointerTrail[trailIndex]
          const age = now - point.time
          if (age > PRESET.trailLengthMs) continue
          const distance = distanceToSegment(point, edge)
          if (distance > radius * 0.65) continue
          const trailStrength = Math.exp(-(distance * distance) / (2 * (radius * 0.25) ** 2))
            * Math.pow(1 - age / PRESET.trailLengthMs, 1.4) * PRESET.flow * 0.5
          strength = Math.max(strength, trailStrength)
        }

        const shimmerPhase = 0.9 + PRESET.shimmer * 0.1 * (0.5 + 0.5 * Math.sin(elapsed * 2.1 + edgeIndex * 0.009))
        strength = Math.max(0, Math.min(1, strength * shimmerPhase * PRESET.glow))
        if (strength >= 0.055) levels[Math.min(LEVELS - 1, Math.floor(strength * LEVELS))].push(edge)
      }
    }

    const strokeLevel = (target: CanvasRenderingContext2D, edgesAtLevel: Edge[], color: string, alpha: number, lineWidth: number) => {
      if (!edgesAtLevel.length) return
      target.beginPath()
      for (const edge of edgesAtLevel) {
        target.moveTo(edge.x1, edge.y1)
        target.lineTo(edge.x2, edge.y2)
      }
      target.strokeStyle = rgba(color, alpha)
      target.lineWidth = lineWidth
      target.stroke()
    }

    const draw = (now: number, animate: boolean) => {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.beginPath()
      for (const edge of edges) {
        context.moveTo(edge.x1, edge.y1)
        context.lineTo(edge.x2, edge.y2)
      }
      context.strokeStyle = rgba(cool, lineAlpha)
      context.lineWidth = PRESET.lineWidth
      context.stroke()

      if (noisePattern && PRESET.grain > 0) {
        context.globalAlpha = 0.34 * PRESET.grain
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
      if (!animate || motionPreference.matches) return

      rebuildGlow(now)
      glowContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      glowContext.clearRect(0, 0, width, height)
      for (let levelIndex = 0; levelIndex < LEVELS; levelIndex += 1) {
        const amount = (levelIndex + 0.5) / LEVELS
        const color = mixHex(cool, hot, Math.max(0, (amount - 0.22) / 0.72))
        strokeLevel(glowContext, levels[levelIndex], color, 0.085 + amount * 0.18, 2.2 + amount * 2.4)
      }
      context.save()
      context.globalCompositeOperation = 'screen'
      context.filter = `blur(${Math.max(4, radius * 0.13)}px)`
      context.drawImage(glowCanvas, 0, 0, width, height)
      context.restore()

      for (let levelIndex = 0; levelIndex < LEVELS; levelIndex += 1) {
        const amount = (levelIndex + 0.5) / LEVELS
        const color = mixHex(cool, hot, Math.max(0, (amount - 0.18) / 0.7))
        strokeLevel(context, levels[levelIndex], color, 0.12 + amount * 0.78, PRESET.lineWidth + amount * (PRESET.litWidth - PRESET.lineWidth))
      }
      context.globalCompositeOperation = 'source-over'
    }

    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf)
      raf = 0
    }
    const animate = (now: number) => {
      raf = 0
      if (!active || !pageVisible || motionPreference.matches) return
      const delta = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60
      lastTime = now

      if (pointerTarget) {
        if (!pointer) pointer = { ...pointerTarget }
        const followAlpha = 1 - Math.exp(-delta / (0.025 + (1 - PRESET.follow) * 0.16))
        pointer.x += (pointerTarget.x - pointer.x) * followAlpha
        pointer.y += (pointerTarget.y - pointer.y) * followAlpha
        if (Math.hypot(pointer.x - pointerTarget.x, pointer.y - pointerTarget.y) > 5 && now - (pointerTrail.at(-1)?.time ?? 0) > 80) {
          pointerTrail.push({ ...pointer, time: now })
        }
      }

      while (pointerTrail.length && now - pointerTrail[0].time > PRESET.trailLengthMs) pointerTrail.shift()
      while (pulses.length && now - pulses[0].time > PRESET.pulseDecayMs * 2.4) pulses.shift()
      draw(now, true)
      raf = window.requestAnimationFrame(animate)
    }

    const schedule = () => {
      if (!raf && active && pageVisible && !motionPreference.matches) raf = window.requestAnimationFrame(animate)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!PRESET.interactive || motionPreference.matches) return
      pointerTarget = { x: event.clientX, y: event.clientY }
      schedule()
    }

    const handlePointerLeave = () => {
      pointerTarget = null
      pointer = null
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!PRESET.clickPulses || motionPreference.matches) return
      pulses.push({ x: event.clientX, y: event.clientY, time: performance.now() })
      schedule()
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      glowCanvas.width = canvas.width
      glowCanvas.height = canvas.height
      readTheme()
      makeEdges()
      draw(performance.now(), !motionPreference.matches)
    }

    const handleThemeChange = () => {
      readTheme()
      draw(performance.now(), !motionPreference.matches)
    }
    const handleVisibility = () => {
      pageVisible = !document.hidden
      if (pageVisible) schedule()
      else stop()
    }
    const handleMotionPreference = () => {
      lastTime = 0
      if (motionPreference.matches) {
        stop()
        pointerTrail.length = 0
        pulses.length = 0
        draw(performance.now(), false)
      } else schedule()
    }

    buildNoise()
    resize()
    const themeObserver = new MutationObserver(handleThemeChange)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibility)
    motionPreference.addEventListener('change', handleMotionPreference)
    schedule()

    return () => {
      active = false
      stop()
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
      motionPreference.removeEventListener('change', handleMotionPreference)
    }
  }, [])

  return <canvas ref={canvasRef} className="hex-glow-background" aria-hidden="true" />
}
