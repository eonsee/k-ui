<template>
  <div class="articles-page">
    <div class="container">
      <!-- 热力图 + 电子木鱼 -->
      <div class="top-section">
        <div class="heatmap-wrapper">
          <ActivityHeatmap :weeks="heatmapWeeks" />
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

      <!-- Article List -->
      <div v-if="filteredArticles.length > 0" class="article-list">
          <router-link
            v-for="article in paginatedArticles"
            :key="article.id"
            :to="`/article/${article.id}`"
            class="article-card"
            :style="{ '--hue': hueFor(article.category) }"
          >
            <h3 class="article-card-title">{{ article.title }}</h3>

            <div class="article-card-body">
              <span class="article-thumb">
                <img
                  v-if="article.cover && !brokenCovers[article.id]"
                  :src="article.cover"
                  alt=""
                  loading="lazy"
                  @error="markCoverBroken(article.id)"
                />
                <span v-else class="thumb-fallback" aria-hidden="true">
                  {{ (article.category || '文').slice(0, 1) }}
                </span>
              </span>

              <div class="article-card-content">
                <p class="article-card-summary">{{ excerptOf(article) }}</p>

                <div class="article-card-meta">
                  <span v-if="article.category" class="meta-category">{{ article.category }}</span>
                  <span class="meta-item"><Calendar :size="13" /> {{ shortDate(article.createdAt) }}</span>
                  <span class="meta-item"><Clock :size="13" /> {{ readTimeLabel(article) }}</span>
                  <span class="meta-item"><Eye :size="13" /> {{ article.views }}</span>
                  <span v-if="article.isRecommend === 1" class="meta-pick">推荐</span>
                </div>
              </div>
            </div>
          </router-link>

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
      </div>

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
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import {
  Search,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  Eye,
} from 'lucide-vue-next'
import { useBlogStore } from '@/store'
import type { Article } from '@/types'
import ActivityHeatmap from '@/components/article/ActivityHeatmap.vue'
import WoodenFish from '@/components/article/WoodenFish.vue'

const blogStore = useBlogStore()
const currentPage = ref(1)
const pageSize = 8

// 热力图展示周数：桌面 33 周刚好填满卡片高度，移动端 26 周
const isNarrow = ref(false)
let narrowQuery: MediaQueryList | null = null
const heatmapWeeks = computed(() => (isNarrow.value ? 26 : 33))

const syncNarrow = (event: MediaQueryListEvent) => {
  isNarrow.value = event.matches
}

// 组件加载时先拉分类，再拉文章（分类映射需要先就绪）
onMounted(async () => {
  narrowQuery = window.matchMedia('(max-width: 768px)')
  isNarrow.value = narrowQuery.matches
  narrowQuery.addEventListener('change', syncNarrow)

  await blogStore.fetchCategories(1)
  blogStore.fetchArticles()
})

onUnmounted(() => {
  narrowQuery?.removeEventListener('change', syncNarrow)
  narrowQuery = null
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

// 根据分类生成稳定的色相，用于分类标签与缩略图兜底色
const hueFor = (category: string) => {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) % 360
  }
  return hash
}

const shortDate = (value: string) => value.slice(0, 10)

// 后端 readTime 多为 0，按正文字数估算一个阅读时长，避免出现「0 分钟」
const readTimeLabel = (article: Article) => {
  if (article.readTime && article.readTime > 0) return `${article.readTime} 分钟`
  const length = (article.content || article.summary || '').replace(/\s+/g, '').length
  return `${Math.max(1, Math.ceil(length / 400))} 分钟`
}

// 列表描述直接展示正文：去掉 Markdown / HTML 标记后压成纯文本
const excerptOf = (article: Article) => {
  const raw = article.content || article.summary || ''
  const text = raw
    .replace(/```[\w-]*/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text || article.summary || '暂无摘要'
}

// 封面加载失败时回退为分类首字占位
const brokenCovers = ref<Record<string, boolean>>({})
const markCoverBroken = (id: string) => {
  brokenCovers.value = { ...brokenCovers.value, [id]: true }
}
</script>

<style scoped>
.articles-page {
  padding: 40px 0 80px;
  min-height: calc(100vh - 64px);
  background: var(--bg-secondary);
}

/* ============ 筛选栏 ============ */
.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  padding: 0;
}

.category-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.category-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.category-tab.active {
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-weight: 600;
}

.category-tab .count {
  padding: 1px 7px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-tertiary);
}

.category-tab.active .count {
  background: color-mix(in srgb, var(--primary-color) 16%, transparent);
  color: var(--primary-color);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  min-width: 220px;
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

/* ============ 热力图 + 电子木鱼 ============ */
.top-section {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: start;
  margin-bottom: 24px;
}

.heatmap-wrapper,
.fish-wrapper {
  display: flex;
  min-width: 0;
}

.heatmap-wrapper > *,
.fish-wrapper > * {
  flex: 1;
  width: 100%;
}

/* 热力图复用为白色卡片，收紧卡片内边距 */
.heatmap-wrapper :deep(.activity-heatmap) {
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
}

[data-theme='dark'] .heatmap-wrapper :deep(.activity-heatmap) {
  border-color: var(--border-color);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

/* 文章卡片：标题在上，缩略图 + 摘要并排，元信息在底部 */
.article-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal),
    border-color var(--transition-normal);
}

.article-card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-fast);
}

.article-card-body {
  display: grid;
  grid-template-columns: 152px minmax(0, 1fr);
  gap: 16px;
}

.article-thumb {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    hsl(var(--hue, 200) 70% 94%),
    hsl(var(--hue, 200) 65% 86%)
  );
}

.article-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.thumb-fallback {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--hue, 200) 45% 45%);
  opacity: 0.55;
}

.article-card-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.article-card-summary {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  margin-top: auto;
  padding-top: 10px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.meta-category {
  padding: 2px 9px;
  border-radius: var(--radius-full);
  background: hsl(var(--hue, 200) 70% 95%);
  color: hsl(var(--hue, 200) 50% 40%);
  font-weight: 500;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-pick {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  font-weight: 500;
}

@media (hover: hover) and (pointer: fine) {
  .article-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: transparent;
  }

  .article-card:hover .article-card-title {
    color: var(--primary-color);
  }

  .article-card:hover .article-thumb img {
    transform: scale(1.05);
  }
}

/* ============ 空状态 ============ */
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

/* ============ 分页 ============ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-btn.active {
  background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-primary));
  border-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* ============ 暗色适配 ============ */
[data-theme='dark'] .article-card {
  border-color: var(--border-color);
}

[data-theme='dark'] .article-card:hover {
  border-color: transparent;
}

[data-theme='dark'] .article-thumb {
  background: linear-gradient(
    135deg,
    hsl(var(--hue, 200) 35% 16%),
    hsl(var(--hue, 200) 30% 11%)
  );
}

[data-theme='dark'] .thumb-fallback {
  color: hsl(var(--hue, 200) 55% 68%);
}

[data-theme='dark'] .meta-category {
  background: hsl(var(--hue, 200) 40% 18%);
  color: hsl(var(--hue, 200) 60% 72%);
}

/* ============ 响应式 ============ */
@media (max-width: 1024px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  /* 单列时木鱼不跟着拉满，保持在参考站的卡片比例 */
  .fish-wrapper {
    width: 100%;
    max-width: 540px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .articles-page {
    padding: 24px 0 56px;
  }

  .fish-wrapper {
    max-width: none;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin: 20px 0;
    padding: 0;
  }

  .category-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 6px;
    scrollbar-width: none;
  }

  .category-tabs::-webkit-scrollbar {
    display: none;
  }

  .category-tab {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 0.8125rem;
  }

  .search-box {
    min-width: 100%;
    width: 100%;
  }

  .article-card {
    gap: 8px;
    padding: 14px;
    border-radius: 14px;
  }

  .article-card-title {
    font-size: 1rem;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .article-card-body {
    grid-template-columns: 104px minmax(0, 1fr);
    gap: 12px;
  }

  .article-thumb {
    border-radius: 8px;
  }

  .article-card-summary {
    font-size: 0.8125rem;
  }

  .article-card-meta {
    gap: 4px 10px;
    padding-top: 6px;
    font-size: 0.6875rem;
  }
}
</style>
