<template>
  <canvas ref="canvasRef" class="hero-bubbles-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const BUBBLE_COUNT = 30

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Bubble {
  sprite: THREE.Sprite
  baseX: number
  y: number
  speed: number
  size: number
  drift: number
  phase: number
  freq: number
  opacity: number
}

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let texture: THREE.CanvasTexture | null = null
let bubbles: Bubble[] = []

let raf = 0
let lastTime = 0
let viewWidth = 0
let viewHeight = 0
let visible = true
let reduced = false

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

// 用 Canvas 画一颗气泡纹理：半透明浅蓝边 + 左上高光 + 右下反光
function createBubbleTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2
  const r = size / 2 - 6

  if (ctx) {
    const rim = ctx.createRadialGradient(c, c, r * 0.5, c, c, r)
    rim.addColorStop(0, 'rgba(150, 195, 235, 0)')
    rim.addColorStop(0.72, 'rgba(150, 195, 235, 0.05)')
    rim.addColorStop(0.9, 'rgba(130, 175, 220, 0.38)')
    rim.addColorStop(1, 'rgba(130, 175, 220, 0)')
    ctx.fillStyle = rim
    ctx.beginPath()
    ctx.arc(c, c, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(130, 175, 220, 0.32)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(c, c, r - 1, 0, Math.PI * 2)
    ctx.stroke()

    const highlight = ctx.createRadialGradient(
      c - r * 0.34, c - r * 0.4, 0,
      c - r * 0.34, c - r * 0.4, r * 0.34
    )
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)')
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = highlight
    ctx.beginPath()
    ctx.arc(c - r * 0.34, c - r * 0.4, r * 0.34, 0, Math.PI * 2)
    ctx.fill()

    const reflection = ctx.createRadialGradient(
      c + r * 0.28, c + r * 0.36, 0,
      c + r * 0.28, c + r * 0.36, r * 0.22
    )
    reflection.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
    reflection.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = reflection
    ctx.beginPath()
    ctx.arc(c + r * 0.28, c + r * 0.36, r * 0.22, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  return tex
}

function resetBubble(bubble: Bubble, fromBottom: boolean) {
  bubble.baseX = Math.random()
  bubble.speed = 0.02 + Math.random() * 0.045
  bubble.size = 8 + Math.pow(Math.random(), 1.8) * 28
  bubble.drift = 0.012 + Math.random() * 0.045
  bubble.phase = Math.random() * Math.PI * 2
  bubble.freq = 0.3 + Math.random() * 0.6
  bubble.opacity = 0.35 + Math.random() * 0.35
  bubble.y = fromBottom ? -0.12 - Math.random() * 0.15 : Math.random() * 1.2
}

function createBubble(initialY: number): Bubble {
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  })
  const sprite = new THREE.Sprite(material)
  const bubble: Bubble = {
    sprite,
    baseX: 0,
    y: initialY,
    speed: 0.03,
    size: 16,
    drift: 0.02,
    phase: 0,
    freq: 0.5,
    opacity: 0.5,
  }
  resetBubble(bubble, false)
  // 首次分布在整个高度内，避免全部从底部挤在一起
  bubble.y = initialY
  return bubble
}

function updateBubbles(dt: number, time: number) {
  if (!viewWidth || !viewHeight) return
  const w = viewWidth
  const h = viewHeight

  for (const bubble of bubbles) {
    bubble.y += bubble.speed * dt
    if (bubble.y > 1.16) resetBubble(bubble, true)

    const x = (bubble.baseX + Math.sin(time * bubble.freq + bubble.phase) * bubble.drift) * w - w / 2
    const y = bubble.y * h - h / 2
    bubble.sprite.position.set(x, y, 0)

    const breathe = 1 + Math.sin(time * 0.9 + bubble.phase) * 0.045
    bubble.sprite.scale.set(bubble.size * breathe, bubble.size * breathe, 1)

    const fadeIn = Math.min(1, Math.max(0, (bubble.y + 0.06) / 0.18))
    const fadeOut = Math.min(1, Math.max(0, (1.12 - bubble.y) / 0.2))
    bubble.sprite.material.opacity = bubble.opacity * Math.min(fadeIn, fadeOut)
  }
}

function resize() {
  const canvas = canvasRef.value
  const parent = canvas?.parentElement
  if (!canvas || !parent || !renderer || !camera) return

  const width = parent.clientWidth || window.innerWidth
  const height = parent.clientHeight || window.innerHeight
  if (!width || !height) return

  viewWidth = width
  viewHeight = height

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)

  camera.left = -width / 2
  camera.right = width / 2
  camera.top = height / 2
  camera.bottom = -height / 2
  camera.updateProjectionMatrix()

  if (reduced) {
    updateBubbles(0, performance.now() / 1000)
    renderer.render(scene!, camera)
  }
}

function animate(now: number) {
  if (!visible || !renderer || !scene || !camera) {
    raf = 0
    return
  }

  const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016
  lastTime = now
  updateBubbles(dt, now / 1000)
  renderer.render(scene, camera)
  raf = requestAnimationFrame(animate)
}

function startLoop() {
  if (reduced || raf) return
  lastTime = 0
  raf = requestAnimationFrame(animate)
}

function stopLoop() {
  if (raf) {
    cancelAnimationFrame(raf)
    raf = 0
  }
}

const onVisibilityChange = () => {
  if (document.hidden) stopLoop()
  else if (visible) startLoop()
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  } catch {
    // WebGL 不可用时仅保留背景渐变
    return
  }

  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  camera.position.z = 10

  texture = createBubbleTexture()

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const bubble = createBubble(Math.random() * 1.2)
    bubbles.push(bubble)
    scene.add(bubble.sprite)
  }

  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.parentElement ?? canvas)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true
      if (visible) startLoop()
      else stopLoop()
    },
    { threshold: 0 }
  )
  intersectionObserver.observe(canvas)

  document.addEventListener('visibilitychange', onVisibilityChange)

  if (reduced) {
    updateBubbles(0, performance.now() / 1000)
    renderer.render(scene, camera)
  } else {
    startLoop()
  }
})

onUnmounted(() => {
  stopLoop()
  resizeObserver?.disconnect()
  resizeObserver = null
  intersectionObserver?.disconnect()
  intersectionObserver = null
  document.removeEventListener('visibilitychange', onVisibilityChange)

  bubbles.forEach((bubble) => {
    bubble.sprite.material.dispose()
  })
  bubbles = []

  texture?.dispose()
  texture = null

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }

  scene = null
  camera = null
})
</script>

<style scoped>
.hero-bubbles-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
