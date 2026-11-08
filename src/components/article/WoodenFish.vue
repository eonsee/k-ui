<template>
  <button
    type="button"
    class="wooden-fish-card"
    aria-label="敲木鱼，功德加一"
    @click="knock"
  >
    <span class="merit-panel">
      <span class="merit-label">功德</span>
      <span ref="countRef" class="merit-count" aria-live="polite">{{ merit }}</span>
    </span>

    <span ref="fishRef" class="fish-stage">
      <span class="fish">
        <svg class="fish-svg" viewBox="0 0 320 240" aria-hidden="true">
          <defs>
            <linearGradient id="wfBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#f9dfae" />
              <stop offset="45%" stop-color="#e3ae6c" />
              <stop offset="100%" stop-color="#b9783a" />
            </linearGradient>
            <clipPath id="wfClip">
              <path
                d="M30 156 C36 112 74 70 130 50 C196 26 268 48 296 104 C316 144 302 184 262 204 C218 226 156 224 108 206 C72 192 44 178 30 156 Z"
              />
            </clipPath>
          </defs>

          <!-- 阴影 -->
          <ellipse cx="164" cy="216" rx="108" ry="14" fill="#5c3a1e" opacity="0.16" />

          <!-- 木鱼主体 -->
          <path
            d="M30 156 C36 112 74 70 130 50 C196 26 268 48 296 104 C316 144 302 184 262 204 C218 226 156 224 108 206 C72 192 44 178 30 156 Z"
            fill="url(#wfBody)"
          />

          <g clip-path="url(#wfClip)">
            <!-- 顶部高光 -->
            <ellipse
              cx="116"
              cy="90"
              rx="66"
              ry="30"
              transform="rotate(-18 116 90)"
              fill="#fff3d8"
              opacity="0.38"
            />
            <ellipse
              cx="244"
              cy="180"
              rx="44"
              ry="16"
              transform="rotate(-12 244 180)"
              fill="#8a4f1f"
              opacity="0.16"
            />

            <!-- 木纹 -->
            <g
              fill="none"
              stroke="#a96833"
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.38"
            >
              <path d="M44 170 C86 150 112 118 124 78" />
              <path d="M58 188 C108 168 140 134 152 84" />
              <path d="M82 202 C138 184 180 152 196 106" />
              <path d="M118 214 C180 202 226 174 244 134" />
              <path d="M164 220 C220 212 258 192 278 160" />
            </g>

            <!-- 鱼口刻槽 -->
            <path
              d="M104 144 C150 126 214 108 272 102 C278 112 276 122 266 128 C208 140 150 152 112 160 C102 157 98 150 104 144 Z"
              fill="#4a2a12"
            />
            <path
              d="M112 160 C154 150 214 140 266 128"
              stroke="#f7d7a1"
              stroke-width="3"
              stroke-linecap="round"
              opacity="0.5"
              fill="none"
            />
          </g>

          <!-- 外轮廓 -->
          <path
            d="M30 156 C36 112 74 70 130 50 C196 26 268 48 296 104 C316 144 302 184 262 204 C218 226 156 224 108 206 C72 192 44 178 30 156 Z"
            fill="none"
            stroke="#7a4a22"
            stroke-width="3.5"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <span
        v-for="item in floaters"
        :key="item.id"
        class="merit-pop"
        :style="{ left: item.left + '%' }"
      >
        +1 功德
      </span>
    </span>

    <span class="tap-hint">敲一敲木鱼</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'wooden-fish-merit'

const merit = ref(0)
const floaters = ref<{ id: number; left: number }[]>([])
const fishRef = ref<HTMLElement | null>(null)
const countRef = ref<HTMLElement | null>(null)

let seed = 0
let audioCtx: AudioContext | null = null

onMounted(() => {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(saved) && saved > 0) merit.value = Math.floor(saved)
  } catch {
    // 隐私模式等场景下 localStorage 不可用，使用 0 作为初始值
  }
})

// 用 Web Audio 合成木鱼声：低频木腔 + 短促敲击
function playKnock() {
  try {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return

    if (!audioCtx) audioCtx = new AudioCtor()
    if (audioCtx.state === 'suspended') void audioCtx.resume()

    const now = audioCtx.currentTime

    const thump = audioCtx.createOscillator()
    const thumpGain = audioCtx.createGain()
    thump.type = 'sine'
    thump.frequency.setValueAtTime(220, now)
    thump.frequency.exponentialRampToValueAtTime(80, now + 0.12)
    thumpGain.gain.setValueAtTime(0.22, now)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
    thump.connect(thumpGain).connect(audioCtx.destination)
    thump.start(now)
    thump.stop(now + 0.17)

    const click = audioCtx.createOscillator()
    const clickGain = audioCtx.createGain()
    click.type = 'triangle'
    click.frequency.setValueAtTime(1100, now)
    click.frequency.exponentialRampToValueAtTime(420, now + 0.035)
    clickGain.gain.setValueAtTime(0.08, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    click.connect(clickGain).connect(audioCtx.destination)
    click.start(now)
    click.stop(now + 0.06)
  } catch {
    // 浏览器不支持 Web Audio 时静默降级，不影响功德计数
  }
}

function animateFish() {
  const el = fishRef.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  el.animate(
    [
      { transform: 'scale(0.965) translateY(4px) rotate(-1deg)' },
      { transform: 'scale(1) translateY(0) rotate(0deg)' },
    ],
    { duration: 200, easing: 'ease-out' }
  )
}

function bumpCount() {
  const el = countRef.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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

  const id = ++seed
  floaters.value.push({ id, left: 56 + Math.random() * 22 })
  window.setTimeout(() => {
    floaters.value = floaters.value.filter(item => item.id !== id)
  }, 1150)

  try {
    localStorage.setItem(STORAGE_KEY, String(merit.value))
  } catch {
    // 存储失败不影响本次点击
  }
}
</script>

<style scoped>
.wooden-fish-card {
  --wf-bg-top: #faf5ea;
  --wf-bg-bottom: #efe4d0;
  --wf-ink: #2a2520;
  --wf-ink-soft: #6b5f52;
  --wf-gold: #b89b5e;
  --wf-gold-deep: #8c6a31;
  --mallet-cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'><path d='M31 6 L16 24' stroke='%238a562a' stroke-width='6' stroke-linecap='round'/><path d='M32.5 7.5 L17.5 25.5' stroke='%23f6d4a7' stroke-width='1.4' stroke-linecap='round' opacity='0.7'/><ellipse cx='13' cy='31' rx='9' ry='7.5' fill='%23c88a4c' stroke='%23663f1d' stroke-width='1.6'/><ellipse cx='11' cy='29' rx='2.8' ry='1.8' fill='%23fff0ca' opacity='0.7'/></svg>") 13 31, pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  min-height: 220px;
  padding: 16px 24px 18px;
  border: 1px solid rgba(92, 63, 33, 0.14);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at 28% 18%, rgba(255, 255, 255, 0.85), transparent 58%),
    linear-gradient(180deg, var(--wf-bg-top), var(--wf-bg-bottom));
  color: var(--wf-ink);
  font: inherit;
  text-align: center;
  cursor: var(--mallet-cursor);
  overflow: visible;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow var(--transition-fast);
}

.wooden-fish-card:hover {
  box-shadow: 0 12px 30px rgba(92, 63, 33, 0.14);
}

.wooden-fish-card:focus-visible {
  outline: 2px solid var(--wf-gold);
  outline-offset: 3px;
}

[data-theme='dark'] .wooden-fish-card {
  --wf-bg-top: #2b241b;
  --wf-bg-bottom: #1c1712;
  --wf-ink: #f2e7d3;
  --wf-ink-soft: #b7a68c;
  --wf-gold: #d9b977;
  --wf-gold-deep: #c39b55;
  border-color: rgba(217, 185, 119, 0.18);
  background:
    radial-gradient(circle at 28% 18%, rgba(255, 236, 200, 0.08), transparent 58%),
    linear-gradient(180deg, var(--wf-bg-top), var(--wf-bg-bottom));
}

[data-theme='dark'] .wooden-fish-card:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.merit-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.merit-label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  color: var(--wf-gold-deep);
}

.merit-count {
  font-family: Georgia, "Songti SC", "STSong", "Times New Roman", serif;
  font-size: clamp(32px, 4.6vw, 44px);
  font-weight: 500;
  color: var(--wf-ink);
  line-height: 1.05;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 4px 14px rgba(184, 155, 94, 0.18);
}

.merit-panel::after {
  content: "";
  width: 64px;
  height: 1px;
  margin-top: 6px;
  background: linear-gradient(90deg, transparent, rgba(140, 106, 49, 0.6), transparent);
}

.fish-stage {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  cursor: var(--mallet-cursor);
}

.fish {
  display: block;
  width: min(58%, 168px);
  filter: drop-shadow(0 12px 14px rgba(60, 40, 20, 0.18));
  will-change: transform;
}

.fish-svg {
  display: block;
  width: 100%;
  height: auto;
}

.merit-pop {
  position: absolute;
  top: 38%;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--wf-gold);
  white-space: nowrap;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  animation: meritFloat 1.15s ease-out forwards;
}

[data-theme='dark'] .merit-pop {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

@keyframes meritFloat {
  0% {
    opacity: 0;
    transform: translate(-6px, 6px) scale(0.75);
  }
  20% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(22px, -52px) scale(1);
  }
}

.tap-hint {
  display: block;
  margin: 0;
  font-family: Georgia, "Songti SC", "STSong", serif;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--wf-ink-soft);
}

@media (prefers-reduced-motion: reduce) {
  .wooden-fish-card {
    transition: none;
  }

  .merit-pop {
    animation-duration: 1ms;
  }
}
</style>
