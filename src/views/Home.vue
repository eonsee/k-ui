<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section ref="heroRef" class="hero-section">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-bubbles" :style="{ '--hero-rise': heroRise }">
          <div
            v-for="(bubble, index) in bubbleStyles"
            :key="index"
            class="bubble"
            :style="bubble"
          ></div>
        </div>
      </div>
      <div class="container hero-content">
        <div class="hero-text">
          <div class="hero-avatar-wrap animate-fade-in-up">
            <div class="hero-avatar-wrapper">
              <img src="/my.jpg" alt="oaken - 全栈开发工程师" class="hero-avatar" />
              <div class="avatar-ring"></div>
            </div>
          </div>
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
        <div class="hero-visual animate-fade-in" style="animation-delay: 0.4s">
          <div class="works-marquee" aria-label="产品轮播">
            <div
              v-for="copy in 2"
              :key="copy"
              class="works-marquee-track"
              :aria-hidden="copy > 1"
            >
              <a
                v-for="(work, index) in marqueeWorks"
                :key="`${copy}-${work.id}-${index}`"
                :href="work.link || '/works'"
                :target="work.link ? '_blank' : undefined"
                :rel="work.link ? 'noopener noreferrer' : undefined"
                class="works-marquee-item"
                :title="work.title"
              >
                <img :src="work.cover" :alt="work.title" loading="lazy" />
              </a>
            </div>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowRight, ArrowUpRight, ChevronDown, Clock, Eye } from 'lucide-vue-next'
import { useBlogStore } from '@/store'

const blogStore = useBlogStore()

// 首页加载时先拉分类，再拉文章和作品
onMounted(async () => {
  await Promise.all([blogStore.fetchCategories(1), blogStore.fetchCategories(2)])
  blogStore.fetchArticles()
  blogStore.fetchWorks()
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
  { value: blogStore.allWorks.length, label: '项目' },
])

const profile = computed(() => blogStore.profileData)
const works = computed(() => blogStore.allWorks)

// 轮播使用的作品封面
const marqueeWorks = computed(() => works.value.filter(work => work.cover))

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

const heroRef = ref<HTMLElement | null>(null)
const heroRise = ref('105vh')
let heroResizeObserver: ResizeObserver | null = null

// 让气泡从底部升出整个 hero：移动端 hero 可能高于 100vh
onMounted(() => {
  const el = heroRef.value
  if (!el || typeof ResizeObserver === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let measured = 0
  heroResizeObserver = new ResizeObserver(() => {
    const height = Math.ceil(el.offsetHeight + 40)
    // 高度变化不大时不重设，避免动画中途跳动
    if (Math.abs(height - measured) < 24) return
    measured = height
    heroRise.value = `${height}px`
  })
  heroResizeObserver.observe(el)
})

onUnmounted(() => {
  heroResizeObserver?.disconnect()
  heroResizeObserver = null
})

// 固定种子生成气泡参数：只在 setup 执行一次，
// 避免打字机/接口数据更新触发重渲染时把气泡随机重置
const seededRandom = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

const getBubbleStyle = (index: number) => {
  const rand = (offset: number) => seededRandom(index * 10 + offset)

  // 小气泡居多，偶尔出现大气泡，更接近真实分布
  const size = Math.pow(rand(1), 2) * 22 + 6
  const left = rand(2) * 94 + 3
  const delay = rand(3) * 5
  const duration = rand(4) * 10 + 12
  const drift = (rand(5) > 0.5 ? 1 : -1) * (rand(6) * 24 + 8)
  const opacity = rand(7) * 0.3 + 0.35

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    '--drift': `${drift.toFixed(1)}px`,
    '--bubble-opacity': opacity.toFixed(2),
  }
}

const bubbleStyles = Array.from({ length: 30 }, (_, index) => getBubbleStyle(index))
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

.hero-bubbles {
  --hero-rise: 105vh;
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 海洋气泡 */
.bubble {
  position: absolute;
  bottom: -30px;
  border-radius: 50%;
  background:
    radial-gradient(ellipse 42% 28% at 32% 24%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 35%, transparent 100%),
    radial-gradient(ellipse 30% 18% at 68% 78%, rgba(255, 255, 255, 0.45) 0%, transparent 100%),
    radial-gradient(circle at 50% 50%, rgba(150, 195, 235, 0.02) 0%, rgba(150, 195, 235, 0.1) 55%, rgba(150, 195, 235, 0.26) 90%, rgba(255, 255, 255, 0.75) 100%);
  border: 1px solid rgba(130, 175, 220, 0.45);
  box-shadow:
    inset -2px -3px 5px rgba(255, 255, 255, 0.4),
    inset 2px 2px 6px rgba(140, 190, 235, 0.14),
    0 1px 4px rgba(120, 170, 220, 0.1);
  opacity: 0;
  animation: bubble-rise linear infinite;
  will-change: transform, opacity;
}

[data-theme='dark'] .bubble {
  border-color: rgba(210, 230, 255, 0.3);
  background:
    radial-gradient(ellipse 42% 28% at 32% 24%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 35%, transparent 100%),
    radial-gradient(ellipse 30% 18% at 68% 78%, rgba(255, 255, 255, 0.4) 0%, transparent 100%),
    radial-gradient(circle at 50% 50%, rgba(150, 200, 255, 0.04) 0%, rgba(150, 200, 255, 0.1) 55%, rgba(150, 200, 255, 0.28) 90%, rgba(255, 255, 255, 0.7) 100%);
  box-shadow:
    inset -2px -3px 5px rgba(255, 255, 255, 0.25),
    inset 2px 2px 6px rgba(150, 200, 255, 0.1),
    0 1px 6px rgba(150, 200, 255, 0.12);
}

@keyframes bubble-rise {
  0% {
    transform: translate3d(0, 0, 0) scale(0.8);
    opacity: 0;
  }
  6% {
    opacity: var(--bubble-opacity, 0.4);
  }
  20% {
    transform: translate3d(calc(var(--drift, 16px) * 0.45), calc(var(--hero-rise, 105vh) * -0.21), 0) scale(1.02);
  }
  36% {
    transform: translate3d(calc(var(--drift, 16px) * -0.3), calc(var(--hero-rise, 105vh) * -0.36), 0) scale(0.97);
  }
  52% {
    transform: translate3d(var(--drift, 16px), calc(var(--hero-rise, 105vh) * -0.51), 0) scale(1.04);
  }
  68% {
    transform: translate3d(calc(var(--drift, 16px) * 0.35), calc(var(--hero-rise, 105vh) * -0.67), 0) scale(0.99);
  }
  84% {
    opacity: var(--bubble-opacity, 0.4);
  }
  100% {
    transform: translate3d(calc(var(--drift, 16px) * -0.45), calc(var(--hero-rise, 105vh) * -1), 0) scale(1.08);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none;
    opacity: 0;
  }
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
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
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

/* 产品轮播（参考 chendahuang.com） */
.works-marquee {
  --marquee-gap: 32px;
  --marquee-duration: 20s;
  display: flex;
  align-items: center;
  gap: var(--marquee-gap);
  width: 100%;
  overflow: hidden;
  padding: 16px 0;
  /* 两侧渐隐：不用背景色遮盖，避免在非纯色 Hero 上出现白色块 */
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 33.333%, #000 66.667%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, #000 33.333%, #000 66.667%, transparent 100%);
}

.works-marquee-track {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--marquee-gap);
  min-width: max-content;
  animation: works-marquee var(--marquee-duration) linear infinite;
}

.works-marquee:hover .works-marquee-track {
  animation-play-state: paused;
}

.works-marquee-item {
  flex-shrink: 0;
  width: 220px;
  height: 220px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transform: rotate(-2deg);
  transition: transform 0.3s ease;
}

.works-marquee-item:nth-child(even) {
  transform: rotate(2deg);
}

.works-marquee-item:hover {
  transform: rotate(0deg) scale(1.04);
}

.works-marquee-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes works-marquee {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(-100% - var(--marquee-gap)), 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .works-marquee-track {
    animation: none;
  }
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
  font-size: 2rem;
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

  .works-marquee-item {
    width: 180px;
    height: 180px;
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
