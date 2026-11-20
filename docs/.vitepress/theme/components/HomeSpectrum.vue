<template>
  <div class="spectrum" aria-hidden="true">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let dispose: (() => void) | undefined

onMounted(() => {
  const element = canvas.value
  const context = element?.getContext('2d')
  if (!element || !context) return
  const ctx = context

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const tau = Math.PI * 2
  const strands = 64
  const segments = 84
  const hues = [336, 8, 283, 239, 184, 158]
  let width = 0
  let height = 0
  let phase = 0
  let lastTime = 0
  let frame = 0
  let visible = false

  // Each cross-section is a folded sheet viewed at a different angle.
  // Connecting matching points along it produces the silk-like filaments.
  function draw() {
    ctx.clearRect(0, 0, width, height)
    const sections = Array.from({ length: segments + 1 }, (_, i) => {
      const u = i / segments
      const angle = tau * u + phase
      const twist = 5.6 * u - 1.15 + .78 * Math.sin(angle - .7)
      return {
        x: width * (u * 1.18 - .09),
        y: height * (.58 - .27 * Math.sin(tau * (u - .14) + .46 * Math.sin(phase)) - .13 * u),
        spread: height * (.21 + .12 * Math.sin(Math.PI * u)),
        tilt: Math.cos(twist),
        depth: Math.sin(twist),
      }
    })
    for (let i = 0; i < strands; i++) {
      const v = i / (strands - 1)
      const across = v * 2 - 1
      const fold = Math.sin(Math.PI * v)
      const light = 47 + 19 * fold + 8 * Math.cos(v * tau * 2 + phase)
      const hue = 16 * across + 19 * Math.sin(phase)
      const ink = ctx.createLinearGradient(0, 0, width, 0)
      hues.forEach((h, j) => ink.addColorStop(j / (hues.length - 1),
        `hsl(${h + hue} 92% ${light + (j === 1 ? 8 : 0)}%)`))
      ctx.strokeStyle = ink
      ctx.lineWidth = Math.max(.85, height / 220) * (i % 8 === 0 ? 1.45 : 1)
      ctx.beginPath()
      sections.forEach((s, j) => {
        const x = s.x + s.spread * (.23 * across * s.depth + .18 * fold * s.tilt)
        const y = s.y + s.spread * (across * s.tilt + .75 * fold * s.depth)
        if (j === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  }

  function tick(now: number) {
    if (!lastTime || now - lastTime >= 32) {
      if (lastTime) phase = (phase + Math.min(now - lastTime, 80) * .00034) % tau
      lastTime = now
      draw()
    }
    frame = requestAnimationFrame(tick)
  }
  function sync() {
    cancelAnimationFrame(frame)
    lastTime = 0
    if (!width || !height || !visible || document.hidden) return
    if (motion.matches) draw()
    else frame = requestAnimationFrame(tick)
  }
  const resize = new ResizeObserver(([entry]) => {
    width = entry.contentRect.width
    height = entry.contentRect.height
    const scale = Math.min(window.devicePixelRatio || 1, 2)
    element.width = Math.round(width * scale)
    element.height = Math.round(height * scale)
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    sync()
  })
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
  resize.observe(element)
  observer.observe(element)
  motion.addEventListener('change', sync)
  document.addEventListener('visibilitychange', sync)
  dispose = () => {
    cancelAnimationFrame(frame)
    resize.disconnect()
    observer.disconnect()
    motion.removeEventListener('change', sync)
    document.removeEventListener('visibilitychange', sync)
  }
})
onUnmounted(() => dispose?.())
</script>

<style scoped>
.spectrum {
  position: relative;
  width: 100%;
  height: clamp(164px, 35vw, 310px);
  pointer-events: none;
}
.spectrum::before {
  content: '';
  position: absolute;
  inset: -15% -26%;
  background:
    radial-gradient(ellipse at 36% 62%, #d771fe22, transparent 47%),
    radial-gradient(ellipse at 68% 42%, #45cfcc22, transparent 44%);
}
.spectrum canvas {
  position: absolute;
  inset-block: -12%;
  inset-inline-start: -17%;
  width: 142%;
  height: 124%;
  mask-image: linear-gradient(90deg, transparent, black 15% 84%, transparent);
}
:global(.dark .VPHero .spectrum canvas) { filter: brightness(1.14) saturate(1.13); }
@media (min-width: 960px) {
  .spectrum { height: clamp(260px, 24vw, 355px); }
  .spectrum canvas { inset-inline-start: -32%; width: 177%; }
}
</style>
