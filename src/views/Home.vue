<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <HeroBubbles />
      </div>
      <div class="container hero-content">
        <div class="hero-text">
          <div class="hero-avatar-wrap animate-fade-in-up">
            <div
              class="hero-avatar-wrapper"
              @pointerenter="startAvatarEmojis"
              @pointerleave="stopAvatarEmojis"
              @click="onAvatarClick"
            >
              <img src="/my.jpg" alt="oaken - 全栈开发工程师" class="hero-avatar" />
              <div class="avatar-ring"></div>
            </div>
            <!-- 悬停头像时连续冒出的微信 emoji -->
            <div class="avatar-emoji-layer" aria-hidden="true">
              <span
                v-for="item in avatarEmojis"
                :key="item.id"
                class="avatar-emoji"
                :style="{
                  '--x': `${item.x}px`,
                  '--y': `${item.y}px`,
                  '--r': `${item.rot}deg`,
                }"
                @animationend="removeAvatarEmoji(item.id)"
              >{{ item.char }}</span>
            </div>
          </div>
          <!-- blend 光标仅作用于文字区域，不包含头像 -->
          <div
            class="hero-copy"
            data-cursor="blend"
            @pointerenter="onCursorEnter"
            @pointermove="onCursorMove"
            @pointerleave="onCursorLeave"
          >
          <h1 class="hero-title animate-fade-in-up" aria-label="oaken">
            <span class="terminal-line">
              <span class="terminal-prompt" aria-hidden="true">&gt;</span>
              <span class="typing-wrap">
                <span class="typing-placeholder" aria-hidden="true">oaken</span>
                <span class="typing-live">
                  <span
                    v-for="(char, index) in typedChars"
                    :key="index"
                    class="typed-char"
                    aria-hidden="true"
                  >{{ char }}</span>
                  <span class="typing-caret" aria-hidden="true"></span>
                </span>
              </span>
            </span>
          </h1>
          <p class="hero-subtitle animate-fade-in-up" style="animation-delay: 0.1s">
            {{ profile.title }}
          </p>
          <p class="hero-description animate-fade-in-up" style="animation-delay: 0.2s">
            {{ profile.bio }}
          </p>
          <div class="hero-stats animate-fade-in-up" style="animation-delay: 0.3s">
            <div v-for="stat in heroStats" :key="stat.label" class="hero-stat">
              <span class="hero-stat-value">{{ stat.value }}</span>
              <span class="hero-stat-label">{{ stat.label }}</span>
            </div>
          </div>
          </div>
        </div>
        <div class="hero-visual animate-fade-in" style="animation-delay: 0.4s">
          <WorksShowcase :works="works" :loading="worksLoading" />
        </div>
      </div>
      <div class="scroll-indicator">
        <ChevronDown :size="24" />
      </div>
    </section>

    <!-- Article List -->
    <section class="article-list-section">
      <div class="container">
        <div class="section-header">
          <div class="section-heading">
            <h2 class="section-title">文章列表</h2>
            <p class="section-subtitle">记录技术、设计与生活</p>
          </div>
          <router-link to="/articles" class="view-all">
            查看全部 <ArrowRight :size="16" />
          </router-link>
        </div>

        <div class="article-list">
          <router-link
            v-for="(article, index) in homepageArticles"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="article-row"
          >
            <span class="article-row-index">{{ String(index + 1).padStart(2, '0') }}</span>

            <div class="article-row-main">
              <div class="article-row-meta">
                <span class="article-row-category">{{ article.category }}</span>
                <span class="article-row-date">{{ article.createdAt }}</span>
              </div>
              <h3 class="article-row-title">{{ article.title }}</h3>
              <p class="article-row-summary">{{ article.summary }}</p>
            </div>

            <div class="article-row-side">
              <div class="article-row-stats">
                <span><Clock :size="13" /> {{ article.readTime }} 分钟</span>
                <span><Eye :size="13" /> {{ article.views }}</span>
              </div>
              <div class="article-row-tags">
                <span v-for="tag in article.tags.slice(0, 2)" :key="tag" class="article-row-tag">{{ tag }}</span>
              </div>
            </div>

            <ArrowUpRight :size="18" class="article-row-arrow" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- DeepSeek 同款 blend 光标：白色圆 + difference 混合 -->
    <Teleport to="body">
      <canvas ref="cursorCanvas" class="custom-cursor-canvas" aria-hidden="true"></canvas>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowRight, ArrowUpRight, ChevronDown, Clock, Eye } from 'lucide-vue-next'
import { useBlogStore } from '@/store'
import WorksShowcase from '@/components/home/WorksShowcase.vue'
import HeroBubbles from '@/components/home/HeroBubbles.vue'

const blogStore = useBlogStore()

// 作品接口返回前，右侧轮播区域显示骨架，不使用静态数据
const worksLoading = ref(true)

// 首页加载时先拉分类，再拉文章和作品
onMounted(async () => {
  try {
    await Promise.all([blogStore.fetchCategories(1), blogStore.fetchCategories(2)])
    blogStore.fetchArticles()
    await blogStore.fetchWorks()
  } finally {
    worksLoading.value = false
  }
})

// ============ 首页姓名打字机效果（循环敲入 / 删除） ============
const HERO_NAME = 'oaken'
const typedName = ref('')
const typedChars = computed(() => typedName.value.split(''))

const TYPE_DELAY = 120
const DELETE_DELAY = 70
const HOLD_DELAY = 1800
const RESTART_DELAY = 600

let typingTimeout: number | undefined

onMounted(() => {
  // 尊重系统的“减少动态效果”设置，直接显示完整姓名
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedName.value = HERO_NAME
    return
  }

  let index = 0
  let deleting = false

  const tick = () => {
    if (!deleting) {
      index++
      typedName.value = HERO_NAME.slice(0, index)
      if (index === HERO_NAME.length) {
        // 完整显示一段时间后再退格
        deleting = true
        typingTimeout = window.setTimeout(tick, HOLD_DELAY)
      } else {
        // 每个字母的间隔略有差异，接近真实敲键盘的节奏
        typingTimeout = window.setTimeout(tick, TYPE_DELAY + Math.random() * 80)
      }
    } else {
      index--
      typedName.value = HERO_NAME.slice(0, index)
      if (index === 0) {
        // 删完后稍作停顿，重新敲入
        deleting = false
        typingTimeout = window.setTimeout(tick, RESTART_DELAY)
      } else {
        typingTimeout = window.setTimeout(tick, DELETE_DELAY)
      }
    }
  }

  typingTimeout = window.setTimeout(tick, 400)
})

onUnmounted(() => {
  if (typingTimeout !== undefined) window.clearTimeout(typingTimeout)
})

// Hero 数据展示：全部来自后端真实数据
// 精华帖子 = 后端标记为推荐的（isRecommend=1），博客文章 = 文章总数，项目 = 作品总数
const heroStats = computed(() => [
  { value: blogStore.allArticles.filter(article => article.isRecommend === 1).length, label: '精华帖子' },
  { value: blogStore.allArticles.length, label: '博客文章' },
  // 作品接口未返回时用占位符，避免先显示 0 再跳变
  { value: worksLoading.value && blogStore.allWorks.length === 0 ? '—' : blogStore.allWorks.length, label: '项目' },
])

const profile = computed(() => blogStore.profileData)
const works = computed(() => blogStore.allWorks)

// 首页文章列表：按发布时间倒序取前 6 篇
const homepageArticles = computed(() =>
  [...blogStore.allArticles]
    .sort((a, b) => {
      const ta = new Date(a.createdAt).getTime()
      const tb = new Date(b.createdAt).getTime()
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
    })
    .slice(0, 6)
)

// ============ DeepSeek 同款 blend 光标 ============
const cursorCanvas = ref<HTMLCanvasElement | null>(null)
let cursorCtx: CanvasRenderingContext2D | null = null
let cursorRaf = 0
let cursorActive = false
let targetX = 0
let targetY = 0
let cursorX = 0
let cursorY = 0
let cursorAlpha = 0
let cursorScale = 0.5
let lastDrawX = 0
let lastDrawY = 0
let lastDrawR = 0

const resizeCursorCanvas = () => {
  const canvas = cursorCanvas.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(window.innerWidth * dpr)
  canvas.height = Math.round(window.innerHeight * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  cursorCtx = ctx
}

const clearLastCursor = () => {
  if (!cursorCtx || !lastDrawR) return
  cursorCtx.clearRect(
    lastDrawX - lastDrawR - 2,
    lastDrawY - lastDrawR - 2,
    (lastDrawR + 2) * 2,
    (lastDrawR + 2) * 2
  )
}

const animateCursor = () => {
  if (!cursorCtx) { cursorRaf = 0; return }
  const dx = targetX - cursorX
  const dy = targetY - cursorY
  const distance = Math.hypot(dx, dy)
  const ease = distance < 50 ? 0.7 : 0.4

  cursorX += dx * ease
  cursorY += dy * ease
  cursorAlpha += ((cursorActive ? 1 : 0) - cursorAlpha) * 0.24
  cursorScale += ((cursorActive ? 1 : 0.5) - cursorScale) * 0.24

  clearLastCursor()

  const radius = 32 * cursorScale
  if (cursorAlpha > 0.002) {
    cursorCtx.save()
    cursorCtx.globalAlpha = cursorAlpha
    cursorCtx.fillStyle = '#ffffff'
    cursorCtx.beginPath()
    cursorCtx.arc(cursorX, cursorY, radius, 0, Math.PI * 2)
    cursorCtx.fill()
    cursorCtx.restore()
    lastDrawX = cursorX
    lastDrawY = cursorY
    lastDrawR = radius
  } else {
    lastDrawR = 0
  }

  const settled =
    Math.abs(dx) + Math.abs(dy) <= 0.1 &&
    Math.abs((cursorActive ? 1 : 0) - cursorAlpha) <= 0.002 &&
    Math.abs((cursorActive ? 1 : 0.5) - cursorScale) <= 0.002

  if (settled) {
    cursorRaf = 0
    if (!cursorActive && cursorCtx) {
      cursorCtx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
  } else {
    cursorRaf = requestAnimationFrame(animateCursor)
  }
}

const ensureCursorLoop = () => {
  if (!cursorRaf) cursorRaf = requestAnimationFrame(animateCursor)
}

const onCursorEnter = (event: PointerEvent) => {
  targetX = event.clientX
  targetY = event.clientY
  cursorX = targetX
  cursorY = targetY
  cursorAlpha = 1
  cursorScale = 1
  cursorActive = true
  ensureCursorLoop()
}

const onCursorMove = (event: PointerEvent) => {
  targetX = event.clientX
  targetY = event.clientY
  ensureCursorLoop()
}

const onCursorLeave = () => {
  cursorActive = false
  ensureCursorLoop()
}

// ============ 头像：三击进入管理后台 ============
const ADMIN_URL = 'http://api.mayekun.com/'
const TRIPLE_CLICK_WINDOW = 600
let avatarClickCount = 0
let avatarClickTimer: number | null = null

const onAvatarClick = () => {
  avatarClickCount += 1
  if (avatarClickTimer !== null) window.clearTimeout(avatarClickTimer)
  if (avatarClickCount >= 3) {
    avatarClickCount = 0
    avatarClickTimer = null
    window.location.href = ADMIN_URL
    return
  }
  avatarClickTimer = window.setTimeout(() => {
    avatarClickCount = 0
    avatarClickTimer = null
  }, TRIPLE_CLICK_WINDOW)
}

// ============ 头像悬停：连续冒出微信 emoji ============
const WECHAT_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😜',
  '😝', '😎', '🤩', '🥳', '🤗', '🤭', '😋', '😚',
]

interface AvatarEmojiPop {
  id: number
  char: string
  x: number
  y: number
  rot: number
}

const avatarEmojis = ref<AvatarEmojiPop[]>([])
let avatarEmojiSeq = 0
let avatarEmojiTimer: number | null = null

const spawnAvatarEmoji = () => {
  const angle = Math.random() * Math.PI * 2
  avatarEmojis.value.push({
    id: ++avatarEmojiSeq,
    char: WECHAT_EMOJIS[Math.floor(Math.random() * WECHAT_EMOJIS.length)],
    x: Math.round(Math.cos(angle) * (36 + Math.random() * 18)),
    y: Math.round(Math.sin(angle) * (30 + Math.random() * 16)),
    rot: Math.round((Math.random() - 0.5) * 40),
  })
}

const startAvatarEmojis = () => {
  stopAvatarEmojis()
  spawnAvatarEmoji()
  avatarEmojiTimer = window.setInterval(spawnAvatarEmoji, 180)
}

const stopAvatarEmojis = () => {
  if (avatarEmojiTimer !== null) {
    window.clearInterval(avatarEmojiTimer)
    avatarEmojiTimer = null
  }
}

const removeAvatarEmoji = (id: number) => {
  avatarEmojis.value = avatarEmojis.value.filter(item => item.id !== id)
}

onMounted(() => {
  resizeCursorCanvas()
  window.addEventListener('resize', resizeCursorCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCursorCanvas)
  stopAvatarEmojis()
  if (avatarClickTimer !== null) window.clearTimeout(avatarClickTimer)
  if (cursorRaf) cancelAnimationFrame(cursorRaf)
})

</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 40px 0 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at bottom left, rgba(37, 99, 235, 0.08) 0%, transparent 50%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 48px;
  align-items: center;
}

.hero-text {
  max-width: 520px;
  text-align: center;
}

/* DeepSeek 同款自定义光标 */
.custom-cursor-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  pointer-events: none;
  mix-blend-mode: difference;
}

@media (hover: none), (pointer: coarse) {
  .custom-cursor-canvas {
    display: none;
  }
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 14px;
  color: #000000;
}

[data-theme='dark'] .hero-title {
  color: #ffffff;
}

/* 终端命令行样式：提示符 + 打字机姓名 */
.terminal-line {
  display: inline-flex;
  align-items: baseline;
  gap: 0.14em;
}

.terminal-prompt {
  font-family: var(--font-mono);
  font-size: 0.75em;
  font-weight: 600;
  color: var(--primary-color);
  user-select: none;
}

/* 打字机姓名：占位符预留宽度，打字过程不引起布局抖动 */
.typing-wrap {
  position: relative;
  display: inline-block;
}

.typing-placeholder {
  visibility: hidden;
}

.typing-live {
  position: absolute;
  top: 0;
  left: 0;
  line-height: inherit;
  white-space: nowrap;
}

.typed-char {
  display: inline-block;
  animation: typed-char-in 0.18s ease-out both;
}

@keyframes typed-char-in {
  from {
    opacity: 0;
    transform: translateY(0.08em);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.typing-caret {
  display: inline-block;
  width: 0.06em;
  min-width: 2px;
  height: 0.9em;
  margin-left: 0.06em;
  background: currentColor;
  border-radius: 1px;
  vertical-align: -0.08em;
  animation: caret-blink 1s steps(1) infinite;
}

@keyframes caret-blink {
  0%,
  50% {
    opacity: 1;
  }
  50.01%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .typed-char {
    animation: none;
  }

  .typing-caret {
    animation: none;
  }
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

.hero-description {
  font-size: 0.9375rem;
  color: var(--text-tertiary);
  line-height: 1.75;
  margin-bottom: 28px;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 20px;
  border-left: 1px solid var(--border-color);
}

.hero-stat:first-child {
  padding-left: 0;
  border-left: none;
}

.hero-stat-value {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 1.1;
  color: var(--text-primary);
}

.hero-stat-label {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: var(--text-tertiary);
}

.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.hero-avatar-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* 头像悬停冒出的 emoji */
.avatar-emoji-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: visible;
  pointer-events: none;
}

.avatar-emoji {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 20px;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  will-change: transform, opacity;
  animation: avatar-emoji-pop 0.95s ease-out forwards;
}

@keyframes avatar-emoji-pop {
  0% {
    opacity: 0;
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.4) rotate(0deg);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y) - 68px)) scale(1.1)
      rotate(var(--r));
  }
}

.hero-avatar-wrapper {
  position: relative;
  width: 112px;
  height: 112px;
  background: var(--bg-secondary);
  border-radius: 50%;
}

.hero-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: var(--shadow-xl);
  position: relative;
  z-index: 1;
}

.avatar-ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  /* 固定中性色，不跟随四季主题变化 */
  border: 2px solid rgba(0, 0, 0, 0.18);
  z-index: 0;
  pointer-events: none;
}

[data-theme='dark'] .avatar-ring {
  border-color: rgba(255, 255, 255, 0.25);
}

.scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--text-tertiary);
  z-index: 10;
  cursor: pointer;
  padding: 8px;
  animation: bounce 2s infinite;
  opacity: 0.6;
}

.scroll-indicator:hover {
  opacity: 1;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* Sections */
.article-list-section {
  padding: 80px 0 96px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.section-heading {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

.view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9375rem;
  color: var(--primary-color);
  font-weight: 500;
}

.view-all:hover {
  color: var(--secondary-color);
}

/* Article List：编辑式横排列表 */
.article-list {
  border-top: 1px solid var(--border-color);
}


.article-row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 190px 24px;
  align-items: center;
  gap: 24px;
  padding: 24px 12px;
  border-bottom: 1px solid var(--border-color);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.25s ease;
}

.article-row-index {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

.article-row-main {
  min-width: 0;
}

.article-row-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.article-row-category {
  font-weight: 600;
  color: var(--primary-color);
}

.article-row-date {
  font-family: var(--font-mono);
}

.article-row-title {
  margin: 6px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.25s ease;
}

.article-row-summary {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-row-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.article-row-stats {
  display: flex;
  gap: 12px;
}

.article-row-stats span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.article-row-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.article-row-tag {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.article-row-arrow {
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease, color 0.25s ease;
}

@media (hover: hover) and (pointer: fine) {
  .article-row:hover {
    background: var(--bg-secondary);
  }

  .article-row:hover .article-row-title {
    color: var(--primary-color);
  }

  .article-row:hover .article-row-arrow {
    opacity: 1;
    color: var(--primary-color);
    transform: translate(2px, -2px);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-text {
    max-width: 100%;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-avatar-wrap {
    justify-content: center;
  }

  .article-row {
    grid-template-columns: 48px minmax(0, 1fr) 24px;
    gap: 16px;
  }

  .article-row-side {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  /* 移动端头像尺寸与参考站点一致（96px） */
  .hero-avatar-wrapper {
    width: 96px;
    height: 96px;
  }

  .article-list-section {
    padding: 56px 0 64px;
  }

  .section-header {
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .article-row {
    grid-template-columns: minmax(0, 1fr) 20px;
    gap: 12px;
    padding: 20px 0;
  }

  .article-row-index {
    display: none;
  }

  .article-row-title {
    font-size: 1rem;
    white-space: normal;
  }

  .article-row-summary {
    -webkit-line-clamp: 2;
  }

  /* 触摸设备没有悬停，箭头常驻以提示可点击 */
  .article-row-arrow {
    opacity: 1;
  }
}
</style>
