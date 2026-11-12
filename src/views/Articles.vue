<template>
  <div class="articles-page">
    <div class="container">
      <!-- Top Section: Heatmap + Wooden Fish -->
      <div class="top-section">
        <div class="heatmap-wrapper">
          <ActivityHeatmap />
        </div>
        <div class="fish-wrapper">
          <WoodenFish />
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="category-tabs">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-tab"
            :class="{ active: currentCategory === category.name }"
            @click="setCategory(category.name)"
          >
            {{ category.name }}
            <span class="count">{{ category.count }}</span>
          </button>
        </div>
        <div class="search-box">
          <Search :size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索文章..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Articles Wall：评论气泡式排布 -->
      <template v-if="filteredArticles.length > 0">
        <div class="comment-wall">
          <router-link
            v-for="article in paginatedArticles"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="comment-item"
            :class="{ 'is-light-tone': isLightTone(article) }"
            :style="{ '--hue': hueFor(article.category), '--tone': toneFor(article) }"
          >
            <span class="comment-cover" aria-hidden="true">
              <img
                v-if="article.cover"
                :src="article.cover"
                alt=""
                loading="lazy"
                @load="onCoverLoad(article, $event)"
                @error="hideBrokenImage"
              />
            </span>

            <span class="comment-badge">{{ article.category }}</span>

            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-name">{{ article.author || 'oaken' }}</span>
              </div>

              <h3 class="comment-title">{{ article.title }}</h3>
              <p class="comment-summary">{{ article.summary }}</p>

              <div class="comment-footer">
                <div class="comment-tags">
                  <span v-for="tag in article.tags.slice(0, 2)" :key="tag" class="comment-tag">{{ tag }}</span>
                </div>
                <div class="comment-stats">
                  <span><Calendar :size="12" /> {{ shortDate(article.createdAt) }}</span>
                  <span><Clock :size="12" /> {{ article.readTime }} 分钟</span>
                  <span><Eye :size="12" /> {{ article.views }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">
            <ChevronsLeft :size="16" />
          </button>
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            <ChevronLeft :size="16" />
          </button>
          <template v-for="page in displayedPages" :key="page">
            <span v-if="page === '...'" class="page-ellipsis">...</span>
            <button
              v-else
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="currentPage = page as number"
            >
              {{ page }}
            </button>
          </template>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
            <ChevronRight :size="16" />
          </button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
            <ChevronsRight :size="16" />
          </button>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <FileQuestion :size="64" />
        <h3>没有找到相关文章</h3>
        <p>尝试更换关键词或分类</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Search, FileQuestion, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar, Clock, Eye } from 'lucide-vue-next'
import { useBlogStore } from '@/store'
import type { Article } from '@/types'
import ActivityHeatmap from '@/components/article/ActivityHeatmap.vue'
import WoodenFish from '@/components/article/WoodenFish.vue'

const blogStore = useBlogStore()
const currentPage = ref(1)
const pageSize = 8

// 组件加载时先拉分类，再拉文章（分类映射需要先就绪）
onMounted(async () => {
  await blogStore.fetchCategories(1)
  blogStore.fetchArticles()
})

const categories = computed(() => blogStore.articleCategories)
const currentCategory = computed(() => blogStore.currentArticleCategory)
const searchQuery = computed({
  get: () => blogStore.searchQuery,
  set: (value) => blogStore.setSearchQuery(value)
})
const filteredArticles = computed(() => blogStore.filteredArticles)

const totalPages = computed(() => Math.ceil(filteredArticles.value.length / pageSize))

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredArticles.value.slice(start, start + pageSize)
})

const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

const setCategory = (category: string) => {
  blogStore.setCategory(category)
  currentPage.value = 1
}

watch(searchQuery, () => {
  currentPage.value = 1
})

// 根据分类生成稳定的色相，让每个气泡有各自的色彩
const hueFor = (category: string) => {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) % 360
  }
  return hash
}

// 直接从已加载的封面提取底色，作为气泡颜色延伸；失败时回退到分类色
const toneMap = ref<Record<string, string>>({})

const onCoverLoad = (article: Article, event: Event) => {
  if (!article.cover || toneMap.value[article.id]) return
  const img = event.target as HTMLImageElement
  try {
    const size = 48
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(img, 0, 0, size, size)
    const data = ctx.getImageData(0, 0, size, size).data
    // 优先取右缘（与内容区衔接处）的颜色，让底色能自然接续
    let r = 0, g = 0, b = 0, count = 0
    const edgeStart = Math.floor(size * 0.82)
    for (let i = 0; i < data.length; i += 4) {
      const px = (i / 4) % size
      if (px < edgeStart) continue
      const pr = data[i], pg = data[i + 1], pb = data[i + 2], pa = data[i + 3]
      if (pa < 128) continue
      const brightness = (pr + pg + pb) / 3
      if (brightness < 20 || brightness > 240) continue
      r += pr; g += pg; b += pb; count++
    }
    if (count === 0) {
      // 右缘不可用时回退到整图平均色
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2], pa = data[i + 3]
        if (pa < 128) continue
        const brightness = (pr + pg + pb) / 3
        if (brightness < 25 || brightness > 235) continue
        r += pr; g += pg; b += pb; count++
      }
    }
    if (count === 0) return
    const color = `${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}`
    toneMap.value = { ...toneMap.value, [article.id]: color }
  } catch {
    // 跨域图片无法读取像素时保持分类兜底色
  }
}

// 分类色相转 RGB，作为封面加载失败时的兜底色
const hslToRgb = (hue: number, saturation = 0.55, lightness = 0.55) => {
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = lightness - c / 2
  let r = 0, g = 0, b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return `${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}`
}

const toneFor = (article: Article) => {
  return toneMap.value[article.id] || hslToRgb(hueFor(article.category))
}

// 根据底色亮度决定文字用白色还是深色
const isLightTone = (article: Article) => {
  const [r, g, b] = toneFor(article).split(',').map(Number)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62
}

const shortDate = (value: string) => value.slice(0, 10)

const hideBrokenImage = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.articles-page {
  padding: 48px 0 80px;
  min-height: calc(100vh - 64px);
}

.top-section {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  align-items: stretch;
  gap: 24px;
  margin-bottom: 32px;
}

.heatmap-wrapper,
.fish-wrapper {
  display: flex;
  min-height: 180px;
}

.heatmap-wrapper > *,
.fish-wrapper > * {
  flex: 1;
  width: 100%;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32px 0;
  flex-wrap: wrap;
  gap: 16px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.category-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.category-tab.active {
  background: var(--primary-gradient);
  color: white;
}

.category-tab .count {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
}

.category-tab.active .count {
  background: rgba(255, 255, 255, 0.2);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  min-width: 240px;
}

.search-box svg {
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Articles Wall：评论气泡式排布 */
.comment-wall {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  align-items: start;
}

.comment-item {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 148px;
  overflow: hidden;
  background: linear-gradient(
    115deg,
    rgb(var(--tone, 6, 182, 212)) 0%,
    rgb(var(--tone, 6, 182, 212)) 55%,
    color-mix(in srgb, rgb(var(--tone, 6, 182, 212)) 92%, var(--bg-primary)) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  color: #fff;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 左侧封面，右缘融入主色背景 */
.comment-cover {
  position: relative;
  flex: 0 0 42%;
  overflow: hidden;
}

.comment-cover img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  -webkit-mask-image: linear-gradient(90deg, #000 58%, transparent 100%);
  mask-image: linear-gradient(90deg, #000 58%, transparent 100%);
}

/* 分类角标 */
.comment-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.18);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92);
}

.comment-content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 10px;
}

/* 桌面端轻微错位与倾斜，营造留言墙的随性 */
@media (min-width: 769px) {
  .comment-wall > .comment-item:nth-child(4n + 1) { transform: rotate(-0.45deg); }
  .comment-wall > .comment-item:nth-child(4n + 3) { transform: rotate(0.4deg); }
  .comment-wall > .comment-item:nth-child(4n + 2) { margin-top: 14px; }
  .comment-wall > .comment-item:nth-child(4n + 4) { margin-top: 24px; }
}

@media (hover: hover) and (pointer: fine) {
  .comment-item:hover {
    transform: translateY(-4px) rotate(0deg);
    box-shadow: var(--shadow-xl);
  }

  .comment-item:hover .comment-cover img {
    transform: scale(1.05);
  }
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
}

.comment-title {
  margin-bottom: 3px;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.35;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-summary {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px dashed rgba(255, 255, 255, 0.2);
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.comment-tag {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.14);
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.8);
}

.comment-stats {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px 10px;
  min-width: 0;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.62);
}

.comment-stats span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* 浅色底：自动切换为深色文字，避免再压黑色遮罩 */
.comment-item.is-light-tone {
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.08);
}

.comment-item.is-light-tone .comment-name,
.comment-item.is-light-tone .comment-title {
  color: #0f172a;
}

.comment-item.is-light-tone .comment-summary {
  color: rgba(15, 23, 42, 0.72);
}

.comment-item.is-light-tone .comment-badge {
  background: rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.78);
}

.comment-item.is-light-tone .comment-footer {
  border-top-color: rgba(15, 23, 42, 0.12);
}

.comment-item.is-light-tone .comment-tag {
  background: rgba(15, 23, 42, 0.07);
  color: rgba(15, 23, 42, 0.65);
}

.comment-item.is-light-tone .comment-stats {
  color: rgba(15, 23, 42, 0.6);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-tertiary);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 40px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin: 24px 0;
  }

  .category-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    min-width: 0;
    width: calc(100% + 32px);
    padding-bottom: 8px;
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
    scrollbar-width: none;
  }

  .category-tabs::-webkit-scrollbar {
    display: none;
  }

  .category-tab {
    padding: 6px 12px;
    font-size: 0.8125rem;
    flex-shrink: 0;
  }

  .search-box {
    min-width: 100%;
    width: 100%;
  }

  /* 移动端改为单列，左右交替像聊天评论 */
  .comment-wall {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .comment-item {
    width: 92%;
    min-height: 124px;
  }

  .comment-item:nth-child(even) {
    margin-left: auto;
  }

  .comment-cover {
    flex-basis: 38%;
    min-height: 108px;
  }

  .comment-content {
    padding: 10px 12px 8px;
  }

  .comment-title {
    font-size: 0.9375rem;
  }

  .comment-stats {
    gap: 3px 8px;
    font-size: 0.625rem;
  }
}
</style>
