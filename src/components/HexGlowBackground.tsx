import { useEffect, useRef } from 'react'

type TrailPoint = { x: number; y: number; time: number }
type Cell = { x: number; y: number }

const TRAIL_LENGTH_MS = 3_000
const FRAME_INTERVAL_MS = 1000 / 60

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
      lineAlpha = Number.parseFloat(root.getPropertyValue('--hex-line-alpha')) || 0.22
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
      context.lineWidth = 0.55
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
        context.globalAlpha = 0.48
        context.fillStyle = noisePattern
        context.fillRect(0, 0, width, height)
        context.globalAlpha = 1
      }

      if (!withGlow || trail.length === 0) return

      const samples: Array<TrailPoint & { strength: number }> = []
      for (let index = trail.length - 1; index >= 0; index -= 1) {
        const point = trail[index]
        const age = now - point.time
        if (age > TRAIL_LENGTH_MS) break
        samples.push({ ...point, strength: Math.pow(1 - age / TRAIL_LENGTH_MS, 1.35) })
      }

      const reachSquared = (radius * 1.65) ** 2
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
            const falloff = Math.exp(-distanceSquared / (radius * radius * 0.62))
            strength = Math.max(strength, falloff * sample.strength)
          }

          if (strength < 0.035) continue
          context.beginPath()
          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
          context.strokeStyle = rgba(hot, Math.min(0.96, strength * 1.25))
          context.lineWidth = 0.55 + strength * 1.2
          context.shadowColor = hot
          context.shadowBlur = 13 * strength
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
      while (trail.length && now - trail[0].time > TRAIL_LENGTH_MS) trail.shift()
      draw(now, true)
      if (trail.length) animationFrame = window.requestAnimationFrame(animate)
      else animationFrame = 0
    }

    const scheduleGlow = () => {
      if (motionPreference.matches || animationFrame) return
      animationFrame = window.requestAnimationFrame(animate)
    }

    const handlePointer = (event: PointerEvent) => {
      if (motionPreference.matches) return
      const now = performance.now()
      const previous = trail[trail.length - 1]
      if (!previous || now - previous.time > 10 || Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 3) {
        trail.push({ x: event.clientX, y: event.clientY, time: now })
      }
      scheduleGlow()
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      radius = Math.max(48, Math.min(78, width / 16))
      tileHeight = radius * Math.sqrt(3)
      readTheme()
      makeCells()
      draw(performance.now(), false)
    }

    const handleMotionPreference = () => {
      trail.length = 0
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      draw(performance.now(), false)
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
    motionPreference.addEventListener('change', handleMotionPreference)

    return () => {
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointer)
      motionPreference.removeEventListener('change', handleMotionPreference)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="hex-glow-background" aria-hidden="true" />
}
