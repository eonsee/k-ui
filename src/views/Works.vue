<template>
  <div class="works-page">
    <div class="container">
      <!-- Category Filter：居中胶囊 + 弱化选中态 -->
      <nav class="category-filter" aria-label="作品分类">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: currentWorkCategory === category.name }"
          @click="setWorkCategory(category.name)"
        >
          <span>{{ category.name }}</span>
          <span v-if="!showSkeleton" class="category-count">{{ category.count }}</span>
        </button>
      </nav>

      <!-- 加载骨架屏：接口未返回前展示，不使用静态数据 -->
      <div
        v-if="showSkeleton"
        class="works-grid skeleton-grid"
        aria-busy="true"
        aria-label="作品加载中"
      >
        <div v-for="n in 6" :key="n" class="work-tile skeleton-tile">
          <div class="skeleton-cover"></div>
          <div class="tile-body">
            <span class="skeleton-line skeleton-title"></span>
            <span class="skeleton-line skeleton-desc"></span>
            <span class="skeleton-line skeleton-desc skeleton-desc-short"></span>
            <span class="skeleton-line skeleton-foot"></span>
          </div>
        </div>
      </div>

      <!-- Works Grid：三列作品卡片 -->
      <div v-else-if="works.length > 0" class="works-grid">
        <article
          v-for="(work, index) in works"
          :key="work.id"
          class="work-tile"
          :style="{ '--i': index }"
        >
          <!-- 封面：有外链时整块可点击 -->
          <a
            class="tile-cover"
            :class="{
              'is-link': Boolean(work.link),
              'is-loaded': loadedCovers.has(work.id),
              'is-failed': failedCovers.has(work.id),
            }"
            :href="work.link || undefined"
            :target="work.link ? '_blank' : undefined"
            :rel="work.link ? 'noopener noreferrer' : undefined"
            :aria-label="work.link ? `访问 ${work.title}` : undefined"
          >
            <img
              :src="work.cover"
              :alt="work.title"
              loading="lazy"
              decoding="async"
              @load="onCoverLoad(work.id)"
              @error="onCoverError(work.id)"
            />
          </a>

          <div class="tile-body">
            <h3 class="tile-title">
              <a
                v-if="work.link"
                :href="work.link"
                target="_blank"
                rel="noopener noreferrer"
              >{{ work.title }}</a>
              <template v-else>{{ work.title }}</template>
            </h3>

            <p v-if="work.description" class="tile-desc">{{ work.description }}</p>

            <div v-if="work.tags.length" class="tile-tags">
              <span v-for="tag in work.tags.slice(0, 3)" :key="tag" class="tile-tag">{{ tag }}</span>
            </div>

            <div class="tile-footer">
              <div class="tile-meta">
                <span v-if="work.category" class="tile-meta-category">{{ work.category }}</span>
                <span v-if="work.category && work.createdAt" class="tile-meta-divider" aria-hidden="true">/</span>
                <span v-if="work.createdAt" class="tile-meta-date">{{ formatDate(work.createdAt) }}</span>
              </div>

              <div v-if="work.github || work.link" class="tile-actions">
                <a
                  v-if="work.github"
                  :href="work.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tile-action"
                >
                  <Github :size="14" />
                  <span>源码</span>
                </a>
                <a
                  v-if="work.link"
                  :href="work.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tile-action is-primary"
                >
                  <ArrowUpRight :size="14" />
                  <span>访问</span>
                </a>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <span>该分类下暂无作品</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowUpRight, Github } from 'lucide-vue-next'
import { useBlogStore } from '@/store'

const blogStore = useBlogStore()
const works = computed(() => blogStore.filteredWorks)
const categories = computed(() => blogStore.workCategories)
const currentWorkCategory = computed(() => blogStore.currentWorkCategory)

// 首次进入时等待分类和作品接口，接口未返回前显示骨架屏
const pageLoading = ref(true)
const showSkeleton = computed(
  () => works.value.length === 0 && (pageLoading.value || blogStore.workLoading)
)

const setWorkCategory = (category: string) => {
  blogStore.setWorkCategory(category)
}

// 展示到年.月即可，兼容 "2024-01-15" 与 "2024-01-15 10:00:00"
const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

// 封面加载完成前显示骨架微光，加载后淡入；失败也结束加载态，避免一直闪
// 用响应式集合而非直接改 DOM，避免 Vue 重新渲染时覆盖 class
const loadedCovers = ref(new Set<string>())
const failedCovers = ref(new Set<string>())

const onCoverLoad = (id: string) => {
  loadedCovers.value.add(id)
}

const onCoverError = (id: string) => {
  loadedCovers.value.add(id)
  failedCovers.value.add(id)
}

onMounted(async () => {
  try {
    await blogStore.fetchCategories(2)
    await blogStore.fetchWorks()
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
.works-page {
  padding: 32px 0 56px;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.works-page > .container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Category Filter：居中胶囊，选中用浅底主题色而非实心 */
.category-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.category-tab {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.category-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.category-tab.active {
  background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-secondary));
  color: var(--primary-color);
}

[data-theme='dark'] .category-tab.active {
  background: color-mix(in srgb, var(--primary-color) 20%, var(--bg-secondary));
}

.category-count {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  opacity: 0.65;
}

.category-tab.active .category-count {
  opacity: 1;
}

/* ============ Works Grid ============ */
.works-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
  align-items: stretch;
}

.work-tile {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
  animation: tile-enter 0.55s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
  animation-delay: calc(var(--i, 0) * 60ms);
}

@keyframes tile-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* 加载骨架屏 */
.skeleton-tile {
  pointer-events: none;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 16 / 10;
}

.skeleton-line {
  display: block;
  height: 10px;
  border-radius: 6px;
}

.skeleton-title {
  width: 52%;
  height: 14px;
}

.skeleton-desc {
  width: 100%;
}

.skeleton-desc-short {
  width: 68%;
}

.skeleton-foot {
  width: 30%;
  margin-top: auto;
}

.skeleton-cover,
.skeleton-line {
  background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--text-tertiary) 10%, var(--bg-secondary)) 25%,
      color-mix(in srgb, var(--text-tertiary) 22%, var(--bg-secondary)) 37%,
      color-mix(in srgb, var(--text-tertiary) 10%, var(--bg-secondary)) 63%
    )
    0 0 / 400% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

/* 封面 */
.tile-cover {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--bg-secondary);
  cursor: default;
  isolation: isolate;
}

.tile-cover.is-link {
  cursor: pointer;
}

/* 加载中的骨架微光 */
.tile-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
      105deg,
      transparent 32%,
      rgba(148, 163, 184, 0.1) 46%,
      rgba(148, 163, 184, 0.2) 52%,
      rgba(148, 163, 184, 0.1) 58%,
      transparent 72%
    )
    0 0 / 220% 100%;
  animation: cover-shimmer 1.7s linear infinite;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

[data-theme='dark'] .tile-cover::before {
  background-image: linear-gradient(
    105deg,
    transparent 32%,
    rgba(255, 255, 255, 0.04) 46%,
    rgba(255, 255, 255, 0.09) 52%,
    rgba(255, 255, 255, 0.04) 58%,
    transparent 72%
  );
}

.tile-cover.is-loaded::before {
  opacity: 0;
  animation: none;
}

@keyframes cover-shimmer {
  from {
    background-position: 120% 0;
  }
  to {
    background-position: -120% 0;
  }
}

.tile-cover img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.tile-cover.is-loaded img {
  opacity: 1;
}

.tile-cover.is-failed img {
  display: none;
}

/* 内容 */
.tile-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px 20px;
  min-width: 0;
}

.tile-meta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.6875rem;
  line-height: 1;
  min-width: 0;
}

.tile-meta-category {
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--primary-color);
}

.tile-meta-divider {
  color: var(--text-tertiary);
  opacity: 0.5;
}

.tile-meta-date {
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.tile-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-primary);
  transition: color 0.25s ease;
}

.tile-title a {
  color: inherit;
}

.tile-desc {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--text-tertiary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tile-tag {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  font-size: 0.6875rem;
}

.tile-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 6px;
}

.tile-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tile-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.tile-action:hover {
  color: var(--primary-color);
}

.tile-action.is-primary {
  color: var(--primary-color);
}

.tile-action.is-primary:hover {
  color: var(--text-primary);
}

/* 悬停：整卡抬升、封面轻推、标题变色 */
@media (hover: hover) and (pointer: fine) {
  .work-tile:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--primary-color) 32%, var(--border-color));
    box-shadow: var(--shadow-lg);
  }

  .work-tile:hover .tile-cover img {
    transform: scale(1.05);
  }

  .work-tile:hover .tile-title {
    color: var(--primary-color);
  }
}

/* 触摸设备无悬停，链接用主题色常驻提示 */
@media (hover: none), (pointer: coarse) {
  .tile-action.is-primary {
    color: var(--primary-color);
  }
}

@media (prefers-reduced-motion: reduce) {
  .work-tile,
  .skeleton-cover,
  .skeleton-line {
    animation: none;
  }

  .tile-cover::before {
    animation: none;
  }

  .tile-cover img {
    transition: none;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1100px) {
  .works-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}

@media (max-width: 680px) {
  .works-page {
    padding: 20px 0 32px;
  }

  .category-filter {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    gap: 8px;
    margin: 0 -16px 20px;
    padding: 0 16px 4px;
    scrollbar-width: none;
  }

  .category-filter::-webkit-scrollbar {
    display: none;
  }

  .category-tab {
    padding: 6px 14px;
    font-size: 0.8125rem;
    flex-shrink: 0;
  }

  .works-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .tile-cover {
    aspect-ratio: 16 / 9;
  }

  .tile-body {
    padding: 16px;
  }

  .tile-title {
    font-size: 1rem;
  }
}
</style>
