<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-bubbles">
          <div v-for="i in 30" :key="i" class="bubble" :style="getBubbleStyle(i)"></div>
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

    <!-- Featured Articles -->
    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精选文章</h2>
          <router-link to="/articles" class="view-all">
            查看全部 <ArrowRight :size="16" />
          </router-link>
        </div>
        <div class="articles-grid">
          <ArticleCard
            v-for="(article, index) in featuredArticles"
            :key="article.id"
            :article="article"
            :style="{ animationDelay: `${index * 0.1}s` }"
            class="animate-fade-in-up"
          />
        </div>
      </div>
    </section>

    <!-- Works Section  -->
    <section class="works-section" :style="worksSectionStyle">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">作品展示</h2>
          <router-link to="/works" class="view-all">
            查看全部 <ArrowRight :size="16" />
          </router-link>
        </div>
        <div class="works-showcase">
          <!-- 左侧作品选择列表 -->
          <div class="works-selector">
            <div
              v-for="work in featuredWorks"
              :key="work.id"
              class="work-item"
              :class="{ active: selectedWork?.id === work.id }"
              @click="selectedWork = work"
            >
              <div class="work-item-thumb">
                <img :src="work.cover" :alt="work.title" />
              </div>
              <div class="work-item-info">
                <span class="work-item-category">{{ work.category }}</span>
                <h4 class="work-item-title">{{ work.title }}</h4>
                <p class="work-item-desc">{{ work.description }}</p>
                <div class="work-item-tags">
                  <span v-for="tag in work.tags.slice(0, 2)" :key="tag" class="mini-tag">{{ tag }}</span>
                </div>
              </div>
              <ChevronRight :size="16" class="work-item-arrow" />
            </div>
          </div>

          <!-- 右侧预览区 -->
          <div class="works-preview">
            <div v-if="selectedWork" class="preview-content">
              <!-- 浏览器窗口 -->
              <div class="preview-browser">
                <div class="browser-toolbar">
                  <div class="browser-dots">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </div>
                  <div class="browser-address">
                    <Lock :size="12" />
                    <span class="address-text">{{ selectedWork.link || '本地预览' }}</span>
                  </div>
                  <div class="browser-actions">
                    <a v-if="selectedWork.link" :href="selectedWork.link" target="_blank" class="browser-action-btn" @click.stop title="新窗口打开">
                      <ExternalLink :size="14" />
                    </a>
                    <a v-if="selectedWork.github" :href="selectedWork.github" target="_blank" class="browser-action-btn" @click.stop title="GitHub">
                      <Github :size="14" />
                    </a>
                  </div>
                </div>
                <div class="browser-viewport">
                  <!-- 有真实链接时用 iframe 展示 -->
                  <iframe
                    v-if="selectedWork.link"
                    :src="selectedWork.link"
                    :title="selectedWork.title"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    loading="lazy"
                  ></iframe>
                  <!-- 无链接时，展示作品图片集 -->
                  <div v-else class="viewport-gallery">
                    <div class="gallery-slides" :style="{ transform: `translateX(-${galleryIndex * 100}%)` }">
                      <div v-for="(img, i) in getWorkImages(selectedWork)" :key="i" class="gallery-slide">
                        <img :src="img" :alt="`${selectedWork.title} - ${i + 1}`" />
                      </div>
                    </div>
                    <div v-if="getWorkImages(selectedWork).length > 1" class="gallery-nav">
                      <button class="gallery-btn" @click="galleryPrev" :disabled="galleryIndex === 0">
                        <ChevronLeft :size="16" />
                      </button>
                      <span class="gallery-indicator">{{ galleryIndex + 1 }} / {{ getWorkImages(selectedWork).length }}</span>
                      <button class="gallery-btn" @click="galleryNext" :disabled="galleryIndex === getWorkImages(selectedWork).length - 1">
                        <ChevronRight :size="16" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 底部信息栏 -->
              <div class="preview-footer">
                <div class="preview-meta">
                  <h3 class="preview-title">{{ selectedWork.title }}</h3>
                  <p class="preview-desc">{{ selectedWork.description }}</p>
                </div>
                <div class="preview-actions">
                  <a v-if="selectedWork.link" :href="selectedWork.link" target="_blank" class="action-btn primary" @click.stop>
                    <ExternalLink :size="15" />
                    访问
                  </a>
                  <a v-if="selectedWork.github" :href="selectedWork.github" target="_blank" class="action-btn outline" @click.stop>
                    <Github :size="15" />
                    源码
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="preview-empty">
              <Monitor :size="48" />
              <p>选择作品查看预览</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ArrowRight, ChevronDown, ChevronRight, ChevronLeft, ExternalLink, Github, Lock, Monitor } from 'lucide-vue-next'
import { useBlogStore } from '@/store'
import ArticleCard from '@/components/article/ArticleCard.vue'
import WorkCard from '@/components/work/WorkCard.vue'
import type { Work } from '@/types'

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
const featuredArticles = computed(() => blogStore.featuredArticles)
const featuredWorks = computed(() => blogStore.filteredWorks.slice(0, 3))

const selectedWork = ref<Work | null>(featuredWorks.value[0] || null)
const galleryIndex = ref(0)

// 获取作品的展示图片
const getWorkImages = (work: Work): string[] => {
  if (work.images && work.images.length > 0) return work.images
  return [work.cover]
}

const galleryPrev = () => {
  if (galleryIndex.value > 0) galleryIndex.value--
}

const galleryNext = () => {
  const work = selectedWork.value
  if (work && galleryIndex.value < getWorkImages(work).length - 1) galleryIndex.value++
}

// 切换作品时重置
watch(selectedWork, () => {
  galleryIndex.value = 0
})

// ============ 作品封面主色提取（可关闭：设为 false 即可） ============
const DOMINANT_COLOR_ENABLED = false

const dominantColor = ref('')

// 从图片提取主色（通过 fetch blob 绕过 CORS）
async function extractDominantColor(imageUrl: string): Promise<string> {
  if (!imageUrl) return ''
  try {
    const resp = await fetch(imageUrl, { mode: 'cors' })
    const blob = await resp.blob()
    const blobUrl = URL.createObjectURL(blob)
    const result = await new Promise<string>((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(''); return }
          const size = 50
          canvas.width = size
          canvas.height = size
          ctx.drawImage(img, 0, 0, size, size)
          const data = ctx.getImageData(0, 0, size, size).data
          let r = 0, g = 0, b = 0, count = 0
          for (let i = 0; i < data.length; i += 4) {
            const pr = data[i], pg = data[i + 1], pb = data[i + 2], pa = data[i + 3]
            if (pa < 128) continue
            const brightness = (pr + pg + pb) / 3
            if (brightness < 30 || brightness > 225) continue
            r += pr; g += pg; b += pb; count++
          }
          if (count === 0) { resolve(''); return }
          resolve(`${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`)
        } catch {
          resolve('')
        }
      }
      img.onerror = () => resolve('')
      img.src = blobUrl
    })
    URL.revokeObjectURL(blobUrl)
    return result
  } catch {
    // CORS 失败时，尝试直接加载（同源图片）
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(''); return }
          const size = 50
          canvas.width = size
          canvas.height = size
          ctx.drawImage(img, 0, 0, size, size)
          const data = ctx.getImageData(0, 0, size, size).data
          let r = 0, g = 0, b = 0, count = 0
          for (let i = 0; i < data.length; i += 4) {
            const pr = data[i], pg = data[i + 1], pb = data[i + 2], pa = data[i + 3]
            if (pa < 128) continue
            const brightness = (pr + pg + pb) / 3
            if (brightness < 30 || brightness > 225) continue
            r += pr; g += pg; b += pb; count++
          }
          if (count === 0) { resolve(''); return }
          resolve(`${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`)
        } catch {
          resolve('')
        }
      }
      img.onerror = () => resolve('')
      img.src = imageUrl
    })
  }
}

// 切换作品时提取主色
watch(selectedWork, async (work) => {
  if (!DOMINANT_COLOR_ENABLED || !work?.cover) {
    dominantColor.value = ''
    return
  }
  dominantColor.value = await extractDominantColor(work.cover)
}, { immediate: true })

// 作品展示区域背景样式
const worksSectionStyle = computed(() => {
  if (!DOMINANT_COLOR_ENABLED || !dominantColor.value) return {}
  return {
    background: `linear-gradient(135deg, rgba(${dominantColor.value}, 0.08) 0%, rgba(${dominantColor.value}, 0.03) 50%, var(--bg-secondary) 100%)`,
  }
})

const getBubbleStyle = (index: number) => {
  // 小气泡居多，偶尔出现大气泡，更接近真实分布
  const size = Math.pow(Math.random(), 2) * 22 + 6
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 12
  const drift = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 24 + 8)
  const opacity = Math.random() * 0.3 + 0.35

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
    transform: translate3d(calc(var(--drift, 16px) * 0.45), -22vh, 0) scale(1.02);
    border-radius: 49% 51% 50% 50% / 51% 49% 51% 49%;
  }
  36% {
    transform: translate3d(calc(var(--drift, 16px) * -0.3), -38vh, 0) scale(0.97);
    border-radius: 51% 49% 49% 51% / 49% 51% 49% 51%;
  }
  52% {
    transform: translate3d(var(--drift, 16px), -54vh, 0) scale(1.04);
    border-radius: 50% 50% 51% 49% / 50% 50% 49% 51%;
  }
  68% {
    transform: translate3d(calc(var(--drift, 16px) * 0.35), -70vh, 0) scale(0.99);
    border-radius: 49% 51% 50% 50% / 51% 49% 50% 50%;
  }
  84% {
    opacity: var(--bubble-opacity, 0.4);
  }
  100% {
    transform: translate3d(calc(var(--drift, 16px) * -0.45), -105vh, 0) scale(1.08);
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
.featured-section,
.works-section {
  padding: 80px 0;
}

.works-section {
  background: var(--bg-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
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

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Works Showcase */
.works-showcase {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

/* 左侧选择列表 */
.works-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  background: var(--bg-primary);
}

.work-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.work-item.active {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.12);
}

.work-item-thumb {
  width: 64px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.work-item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-item-info {
  flex: 1;
  min-width: 0;
}

.work-item-category {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.work-item-title {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-item-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-item-tags {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.mini-tag {
  padding: 1px 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  color: var(--text-tertiary);
}

.work-item-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
  opacity: 0;
  transition: all 0.25s ease;
}

.work-item:hover .work-item-arrow,
.work-item.active .work-item-arrow {
  opacity: 1;
  color: var(--primary-color);
}

/* 右侧预览区 */
.works-preview {
  position: sticky;
  top: 80px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.preview-content {
  display: flex;
  flex-direction: column;
}

/* 浏览器窗口 */
.preview-browser {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
}

.browser-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #1e1e2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.browser-dots {
  display: flex;
  gap: 7px;
}

.browser-dots .dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.browser-dots .dot:nth-child(1) { background: #ff5f57; }
.browser-dots .dot:nth-child(2) { background: #febc2e; }
.browser-dots .dot:nth-child(3) { background: #28c840; }

.browser-address {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  min-width: 0;
}

.address-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.browser-actions {
  display: flex;
  gap: 6px;
}

.browser-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.browser-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.browser-viewport {
  height: 420px;
  background: #f5f5f5;
  overflow: hidden;
}

.browser-viewport iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.viewport-gallery {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.gallery-slides {
  width: 100%;
  height: 100%;
  display: flex;
  transition: transform 0.4s ease;
}

.gallery-slide {
  min-width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.gallery-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-nav {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  z-index: 10;
}

.gallery-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.gallery-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.gallery-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.gallery-indicator {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-variant-numeric: tabular-nums;
  min-width: 40px;
  text-align: center;
}

/* 底部信息栏 */
.preview-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.preview-meta {
  min-width: 0;
  flex: 1;
}

.preview-title {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.preview-desc {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: var(--radius-lg);
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.action-btn.primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  color: white;
}

.action-btn.outline {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.action-btn.outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  gap: 12px;
  color: var(--text-tertiary);
}

.preview-empty p {
  font-size: 0.9375rem;
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

  .articles-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .works-showcase {
    grid-template-columns: 1fr;
  }

  .works-selector {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
    gap: 12px;
  }

  .work-item {
    min-width: 220px;
    flex-shrink: 0;
  }

  .works-preview {
    position: static;
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

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .works-showcase {
    grid-template-columns: 1fr;
  }

  .works-selector {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
    gap: 10px;
  }

  .work-item {
    min-width: 200px;
    flex-shrink: 0;
  }

  .browser-viewport {
    height: 280px;
  }

  .preview-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .preview-actions {
    margin-left: 0;
  }

}
</style>
