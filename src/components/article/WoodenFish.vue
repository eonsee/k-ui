<template>
  <section class="wooden-fish" aria-label="电子木鱼">
    <h3 class="wf-title">电子木鱼</h3>

    <div class="wf-body">
      <span ref="countRef" class="wf-count" aria-live="polite">{{ merit }}</span>

      <button
        ref="fishRef"
        type="button"
        class="wf-fish"
        aria-label="敲木鱼，功德加一"
        @click="knock"
      >
        <svg class="wf-svg" viewBox="0 0 247 197" aria-hidden="true">
          <defs>
            <mask :id="maskId">
              <rect width="247" height="197" fill="#000" />
              <path :d="FISH_PATH" fill="#fff" />
              <circle cx="168" cy="111" r="27" fill="#000" />
              <rect x="168" y="104" width="80" height="14" fill="#000" />
            </mask>
          </defs>
          <path :d="FISH_PATH" fill="currentColor" :mask="`url(#${maskId})`" />
        </svg>

        <span
          v-for="item in floaters"
          :key="item.id"
          class="wf-floater"
          :style="{ left: item.left + '%' }"
        >
          功德+1，佛祖保佑你
        </span>
      </button>

      <div class="wf-footer">
        <span class="wf-auto-label">自动敲</span>
        <button
          type="button"
          role="switch"
          class="wf-switch"
          :class="{ on: auto }"
          :aria-checked="auto"
          aria-label="自动敲"
          @click="toggleAuto"
        >
          <span class="wf-switch-thumb"></span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const STORAGE_KEY = 'wooden-fish-merit'
const KNOCK_INTERVAL = 700

// 扁平木鱼剪影：一个圆润的鱼身，右侧用遮罩挖出圆孔 + 横向缝隙
const FISH_PATH =
  'M109.5 6.5C128 3.8 152 3.6 174 10.2C197 17 216 32 228 52C238 68.5 243.5 87 245 105C245.8 114 245.5 122 244 131C241.5 148 233 163 219 175C202 190 180 195.5 158 195.5C128 195.5 95 192.5 67 186C46 181 27 174.5 15 164C6 156 2 146 3 136C4 126 10 118 19 113C25.5 109.5 31.5 107 36 105.5C39 99 41 91.5 43.5 83C49.5 59 62 38 78 24C87 16 98 10 109.5 6.5Z'

const maskId = `wf-mask-${Math.random().toString(36).slice(2, 8)}`

const merit = ref(0)
const auto = ref(false)
const floaters = ref<{ id: number; left: number }[]>([])
const fishRef = ref<HTMLElement | null>(null)
const countRef = ref<HTMLElement | null>(null)

let seed = 0
let autoTimer: number | undefined
let audioCtx: AudioContext | null = null
let knockBuffer: AudioBuffer | null = null
const floaterTimers = new Set<number>()

// 预加载参考站的木鱼音频；顺手裁掉文件开头约 45ms 的静音，让敲击更跟手
async function loadKnockSample() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}audio/wooden-fish.mp3`)
    if (!res.ok) return

    const data = await res.arrayBuffer()
    const offline = new OfflineAudioContext(1, 1, 44100)
    const decoded = await offline.decodeAudioData(data)

    const threshold = 0.01
    const channel = decoded.getChannelData(0)
    let start = 0
    while (start < channel.length && Math.abs(channel[start]) < threshold) start++
    start = Math.max(0, start - 64)

    if (start === 0) {
      knockBuffer = decoded
      return
    }

    const trimmed = offline.createBuffer(
      decoded.numberOfChannels,
      decoded.length - start,
      decoded.sampleRate
    )
    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      trimmed.copyToChannel(decoded.getChannelData(ch).subarray(start), ch)
    }
    knockBuffer = trimmed
  } catch {
    // 音频加载/解码失败时保留合成声兜底
  }
}

onMounted(() => {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(saved) && saved > 0) merit.value = Math.floor(saved)
  } catch {
    // 隐私模式等场景下 localStorage 不可用，使用 0 作为初始值
  }

  void loadKnockSample()
})

onUnmounted(() => {
  stopAuto()
  floaterTimers.forEach(timer => window.clearTimeout(timer))
  floaterTimers.clear()
  if (audioCtx) {
    void audioCtx.close()
    audioCtx = null
  }
})

// 优先播放参考站的木鱼音频；加载/解码失败时回退到合成声
function playKnock() {
  try {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return

    if (!audioCtx) audioCtx = new AudioCtor()
    if (audioCtx.state === 'suspended') void audioCtx.resume()

    const ctx = audioCtx

    if (knockBuffer) {
      const source = ctx.createBufferSource()
      source.buffer = knockBuffer
      const gain = ctx.createGain()
      gain.gain.value = 0.9
      source.connect(gain).connect(ctx.destination)
      source.start()
      return
    }

    playSynthKnock(ctx)
  } catch {
    // 浏览器不支持 Web Audio 时静默降级，不影响功德计数
  }
}

// 兜底合成声：约 640Hz 的木质共振，短促撞击 + 约 200ms 余响
function playSynthKnock(ctx: AudioContext) {
  const now = ctx.currentTime

  const master = ctx.createGain()
  // 每一击略微变化，连续自动敲时不会过于机械
  master.gain.value = 0.9 * (0.94 + Math.random() * 0.12)
  master.connect(ctx.destination)

  const detune = 1 + (Math.random() - 0.5) * 0.03

  const addMode = (freq: number, gain: number, decay: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * detune

    const env = ctx.createGain()
    env.gain.setValueAtTime(0, now)
    env.gain.linearRampToValueAtTime(gain, now + 0.004)
    env.gain.exponentialRampToValueAtTime(0.0004, now + decay)

    osc.connect(env).connect(master)
    osc.start(now)
    osc.stop(now + decay + 0.02)
  }

  // 快速衰减的敲击主体
  addMode(600, 0.18, 0.07)
  addMode(640, 0.28, 0.06)
  addMode(690, 0.12, 0.05)

  // 长尾余响
  addMode(570, 0.015, 0.45)
  addMode(600, 0.025, 0.35)
  addMode(640, 0.04, 0.4)
  addMode(690, 0.015, 0.3)

  // 木质撞击的瞬态噪声
  const len = Math.floor(ctx.sampleRate * 0.025)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
  }

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 1000
  bandpass.Q.value = 1

  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.18

  noise.connect(bandpass).connect(noiseGain).connect(master)
  noise.start(now)
}

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function animateFish() {
  const el = fishRef.value
  if (!el || reduceMotion()) return

  el.animate(
    [
      { transform: 'scale(0.94) translateY(3px)' },
      { transform: 'scale(1) translateY(0)' },
    ],
    { duration: 180, easing: 'cubic-bezier(0.5, 0.35, 0.15, 1.4)' }
  )
}

function bumpCount() {
  const el = countRef.value
  if (!el || reduceMotion()) return

  el.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.08)' },
      { transform: 'scale(1)' },
    ],
    { duration: 160, easing: 'ease-out' }
  )
}

function knock() {
  merit.value += 1
  playKnock()
  animateFish()
  bumpCount()

  if (!reduceMotion()) {
    const id = ++seed
    floaters.value.push({ id, left: 45 + Math.random() * 12 })
    const timer = window.setTimeout(() => {
      floaters.value = floaters.value.filter(item => item.id !== id)
      floaterTimers.delete(timer)
    }, 1000)
    floaterTimers.add(timer)
  }

  try {
    localStorage.setItem(STORAGE_KEY, String(merit.value))
  } catch {
    // 存储失败不影响本次点击
  }
}

function stopAuto() {
  auto.value = false
  if (autoTimer !== undefined) {
    window.clearInterval(autoTimer)
    autoTimer = undefined
  }
}

function toggleAuto() {
  if (auto.value) {
    stopAuto()
    return
  }
  auto.value = true
  autoTimer = window.setInterval(knock, KNOCK_INTERVAL)
}
</script>

<style scoped>
.wooden-fish {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
}

.wf-title {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.6;
  color: var(--text-primary);
}

.wf-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 0 2px;
}

.wf-count {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 400;
  line-height: 1;
  color: #484c53;
  font-variant-numeric: tabular-nums;
}

.wf-fish {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  padding: 0;
  border: none;
  background: transparent;
  color: #484c53;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.wf-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.wf-fish:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 6px;
  border-radius: 12px;
}

.wf-floater {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--text-primary);
  white-space: nowrap;
  pointer-events: none;
  animation: wf-float 1s ease-out forwards;
}

@keyframes wf-float {
  0% {
    opacity: 0;
    transform: translate(-50%, 6px);
  }
  15% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -30px);
  }
}

.wf-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.wf-auto-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.wf-switch {
  position: relative;
  width: 40px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.14);
  cursor: pointer;
  transition: background-color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.wf-switch.on {
  background: var(--primary-color);
}

.wf-switch:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 3px;
}

.wf-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.wf-switch.on .wf-switch-thumb {
  transform: translateX(18px);
}

/* 宽卡片改为横向排布：数字与木鱼并排，压缩卡片高度 */
@container (min-width: 360px) {
  .wf-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 6px 12px;
    padding: 4px 0 0;
  }

  .wf-count {
    justify-self: center;
  }

  .wf-fish {
    justify-self: center;
  }

  .wf-footer {
    grid-column: 1 / -1;
  }
}

[data-theme='dark'] .wooden-fish {
  border-color: var(--border-color);
}

[data-theme='dark'] .wf-count,
[data-theme='dark'] .wf-fish {
  color: #c8c8c8;
}

[data-theme='dark'] .wf-switch {
  background: rgba(255, 255, 255, 0.18);
}

[data-theme='dark'] .wf-switch.on {
  background: var(--primary-color);
}

@media (prefers-reduced-motion: reduce) {
  .wf-floater {
    animation-duration: 0.01ms;
  }

  .wf-switch,
  .wf-switch-thumb {
    transition: none;
  }
}
</style>
