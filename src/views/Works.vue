<template>
  <div class="works-page">
    <div class="container">
      <!-- 移动端：保留改版前的分类 + 作品列表布局 -->
      <WorksLegacyMobile v-if="isMobile" :loading="pageLoading" />

      <template v-else>
        <!-- Work Filter：以作品名称切换，居中胶囊 + 弱化选中态 -->
      <nav ref="filterNav" v-if="works.length > 0" class="work-filter" aria-label="作品列表">
        <span
          class="work-tab-indicator"
          :class="{ 'is-ready': indicatorReady }"
          :style="indicatorStyle"
          aria-hidden="true"
        ></span>
        <button
          v-for="work in works"
          :key="work.id"
          :ref="el => setTabRef(work.id, el)"
          class="work-tab"
          :class="{ active: selectedWork?.id === work.id }"
          :aria-pressed="selectedWork?.id === work.id"
          :title="work.title"
          @click="selectWork(work.id)"
        >
          {{ work.title }}
        </button>
      </nav>

      <!-- 加载骨架屏：接口未返回前展示，不使用静态数据 -->
      <div
        v-if="showSkeleton"
        class="work-panel skeleton-panel"
        aria-busy="true"
        aria-label="作品加载中"
      >
        <div class="skeleton-cover"></div>
        <div class="panel-body">
          <span class="skeleton-line skeleton-meta"></span>
          <span class="skeleton-line skeleton-title"></span>
          <span class="skeleton-line skeleton-desc"></span>
          <span class="skeleton-line skeleton-desc skeleton-desc-short"></span>
          <span class="skeleton-line skeleton-foot"></span>
        </div>
      </div>

      <!-- 当前作品：全宽长条卡片，点击上方作品名切换 -->
      <div v-else-if="selectedWork" class="work-stage">
        <Transition name="work-switch">
          <article
            :key="selectedWork.id"
            class="work-panel"
            :style="{ '--switch-dir': switchDir }"
          >
          <!-- 封面：有外链时整块可点击 -->
          <a
            class="panel-cover"
            :class="{
              'is-link': Boolean(selectedWork.link),
              'is-loaded': loadedCovers.has(selectedWork.id),
              'is-failed': failedCovers.has(selectedWork.id),
            }"
            :href="selectedWork.link || undefined"
            :target="selectedWork.link ? '_blank' : undefined"
            :rel="selectedWork.link ? 'noopener noreferrer' : undefined"
            :aria-label="selectedWork.link ? `访问 ${selectedWork.title}` : undefined"
          >
            <img
              :src="selectedWork.cover"
              :alt="selectedWork.title"
              decoding="async"
              @load="onCoverLoad(selectedWork.id)"
              @error="onCoverError(selectedWork.id)"
            />
          </a>

          <div class="panel-body">
            <div class="panel-meta">
              <span v-if="selectedWork.category" class="panel-meta-category">{{ selectedWork.category }}</span>
              <span v-if="selectedWork.category && selectedWork.createdAt" class="panel-meta-divider" aria-hidden="true">/</span>
              <span v-if="selectedWork.createdAt" class="panel-meta-date">{{ formatDate(selectedWork.createdAt) }}</span>
            </div>

            <h3 class="panel-title">
              <a
                v-if="selectedWork.link"
                :href="selectedWork.link"
                target="_blank"
                rel="noopener noreferrer"
              >{{ selectedWork.title }}</a>
              <template v-else>{{ selectedWork.title }}</template>
            </h3>

            <p v-if="selectedWork.description" class="panel-desc">{{ selectedWork.description }}</p>

            <div v-if="selectedWork.tags.length" class="panel-tags">
              <span v-for="tag in selectedWork.tags" :key="tag" class="panel-tag">{{ tag }}</span>
            </div>

            <div v-if="selectedWork.github || selectedWork.link" class="panel-actions">
              <a
                v-if="selectedWork.github"
                :href="selectedWork.github"
                target="_blank"
                rel="noopener noreferrer"
                class="panel-action"
              >
                <Github :size="15" />
                <span>源码</span>
              </a>
              <a
                v-if="selectedWork.link"
                :href="selectedWork.link"
                target="_blank"
                rel="noopener noreferrer"
                class="panel-action is-primary"
              >
                <ArrowUpRight :size="15" />
                <span>访问</span>
              </a>
            </div>
          </div>
          </article>
        </Transition>
      </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <span>暂无作品</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ArrowUpRight, Github } from 'lucide-vue-next'
import { useBlogStore } from '@/store'
import WorksLegacyMobile from '@/components/work/WorksLegacyMobile.vue'

const blogStore = useBlogStore()
const works = computed(() => blogStore.allWorks)

// 移动端（≤680px）沿用改版前的分类 + 作品列表布局
const MOBILE_QUERY = '(max-width: 680px)'
const mobileMedia = window.matchMedia(MOBILE_QUERY)
const isMobile = ref(mobileMedia.matches)

const onMobileChange = (event: MediaQueryListEvent) => {
  isMobile.value = event.matches
  if (event.matches) {
    stopAutoSwitch()
  } else {
    startAutoSwitch()
    updateIndicator()
  }
}

// ============ 选中态白色胶囊：跟随当前作品名滑动 ============
const filterNav = ref<HTMLElement | null>(null)
const tabRefs = new Map<string, HTMLElement>()
const indicatorStyle = ref<Record<string, string>>({})
const indicatorReady = ref(false)

const setTabRef = (id: string, el: unknown) => {
  if (el instanceof HTMLElement) tabRefs.set(id, el)
  else tabRefs.delete(id)
}

const updateIndicator = () => {
  nextTick(() => {
    const nav = filterNav.value
    const tab = selectedId.value ? tabRefs.get(selectedId.value) : null
    if (!nav || !tab) return
    const navRect = nav.getBoundingClientRect()
    const rect = tab.getBoundingClientRect()
    indicatorStyle.value = {
      width: `${Math.round(rect.width)}px`,
      height: `${Math.round(rect.height)}px`,
      transform: `translate(${Math.round(rect.left - navRect.left)}px, ${Math.round(rect.top - navRect.top)}px)`,
    }
    if (!indicatorReady.value) {
      requestAnimationFrame(() => {
        indicatorReady.value = true
      })
    }
  })
}

// 当前选中的作品：默认选中第一项，接口数据变化后若失效则回退到第一项
const selectedId = ref<string | null>(null)
const selectedWork = computed(
  () => works.value.find(work => work.id === selectedId.value) ?? null
)
// 切换方向：1 向后（新卡片从右侧揭入），-1 向前（从左侧揭入）
const switchDir = ref(1)

// 作品每 7 秒自动切换，手动点击后重新计时
const AUTO_SWITCH_MS = 7000
let autoTimer: number | null = null

function stopAutoSwitch() {
  if (autoTimer !== null) {
    window.clearInterval(autoTimer)
    autoTimer = null
  }
}

const startAutoSwitch = () => {
  stopAutoSwitch()
  // 移动端展示全部作品列表，不需要自动切换
  if (isMobile.value || works.value.length < 2) return
  autoTimer = window.setInterval(() => {
    // 页面切到后台时暂停切换
    if (document.hidden) return
    const list = works.value
    const currentIndex = list.findIndex(work => work.id === selectedId.value)
    const next = list[(currentIndex + 1) % list.length]
    if (next) {
      switchDir.value = 1
      selectedId.value = next.id
    }
  }, AUTO_SWITCH_MS)
}

const selectWork = (id: string) => {
  const list = works.value
  const from = list.findIndex(work => work.id === selectedId.value)
  const to = list.findIndex(work => work.id === id)
  if (from !== -1 && to !== -1 && to !== from) {
    switchDir.value = to > from ? 1 : -1
  }
  selectedId.value = id
  startAutoSwitch()
}

watch(
  works,
  (list) => {
    if (list.length === 0) {
      selectedId.value = null
      stopAutoSwitch()
      return
    }
    if (!list.some(work => work.id === selectedId.value)) {
      selectedId.value = list[0].id
    }
    startAutoSwitch()
    updateIndicator()
  },
  { immediate: true }
)

// 选中作品变化时，白色胶囊滑向新的作品名
watch(selectedId, () => updateIndicator())

onUnmounted(() => {
  mobileMedia.removeEventListener('change', onMobileChange)
  window.removeEventListener('resize', updateIndicator)
  stopAutoSwitch()
})

// 首次进入时等待分类和作品接口，接口未返回前显示骨架屏
const pageLoading = ref(true)
const showSkeleton = computed(
  () => works.value.length === 0 && (pageLoading.value || blogStore.workLoading)
)

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
  mobileMedia.addEventListener('change', onMobileChange)
  window.addEventListener('resize', updateIndicator)
  document.fonts?.ready.then(updateIndicator)
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
  padding: 32px 0;
  display: flex;
  flex-direction: column;
}

.works-page > .container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Work Filter：作品名称胶囊，白色选中态在标签间滑动 */
.work-filter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

/* 选中态白色胶囊：位置和宽度跟随当前作品名 */
.work-tab-indicator {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  border-radius: var(--radius-full);
  background: #fff;
  opacity: 0;
  pointer-events: none;
}

.work-tab-indicator.is-ready {
  opacity: 1;
  transition: transform 0.45s cubic-bezier(0.34, 1.25, 0.64, 1),
    width 0.45s cubic-bezier(0.34, 1.25, 0.64, 1), height 0.2s ease,
    opacity 0.25s ease;
}

.work-tab {
  position: relative;
  z-index: 1;
  max-width: 18em;
  padding: 7px 16px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.work-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* 选中态由底层白色胶囊呈现，按钮本身透明 */
.work-tab.active,
.work-tab.active:hover {
  background: transparent;
  color: #0b1220;
}

/* ============ 长条作品卡片 ============ */
.work-panel {
  --panel-h: clamp(520px, 64vh, 700px);
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  min-height: var(--panel-h);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* 切换作品：新卡片从切换方向滑入并覆盖旧卡片，全程不透明，避免白屏闪烁 */
.work-stage {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
}

.work-switch-enter-active {
  position: relative;
  z-index: 2;
  will-change: transform;
  transition: transform 0.62s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* 旧卡片保持不透明垫在下方，等新卡片完全覆盖后再移除 */
.work-switch-leave-active {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* 略长于入场时间，确保新卡片完全覆盖后再移除旧卡片 */
  transition: opacity 0.7s linear;
}

.work-switch-enter-from {
  transform: translateX(calc(100% * var(--switch-dir, 1)));
}

.work-switch-leave-to {
  opacity: 0.99;
}

/* 新卡片封面轻微回落 */
.work-switch-enter-active .panel-cover img {
  animation: switch-cover-settle 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
}

@keyframes switch-cover-settle {
  from {
    transform: scale(1.06);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .work-switch-enter-active,
  .work-switch-leave-active {
    transition: none;
  }

  .work-switch-enter-active .panel-cover img {
    animation: none;
  }
}

/* 加载骨架屏 */
.skeleton-panel {
  pointer-events: none;
}

.skeleton-cover {
  min-height: var(--panel-h);
}

.skeleton-line {
  display: block;
  height: 12px;
  border-radius: 6px;
}

.skeleton-meta {
  width: 22%;
  height: 10px;
}

.skeleton-title {
  width: 46%;
  height: 22px;
}

.skeleton-desc {
  width: 100%;
}

.skeleton-desc-short {
  width: 68%;
}

.skeleton-foot {
  width: 24%;
  height: 28px;
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
.panel-cover {
  position: relative;
  display: block;
  min-height: var(--panel-h);
  overflow: hidden;
  background: var(--bg-secondary);
  cursor: default;
  isolation: isolate;
}

.panel-cover.is-link {
  cursor: pointer;
}

/* 加载中的骨架微光 */
.panel-cover::before {
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

[data-theme='dark'] .panel-cover::before {
  background-image: linear-gradient(
    105deg,
    transparent 32%,
    rgba(255, 255, 255, 0.04) 46%,
    rgba(255, 255, 255, 0.09) 52%,
    rgba(255, 255, 255, 0.04) 58%,
    transparent 72%
  );
}

.panel-cover.is-loaded::before {
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

.panel-cover img {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.panel-cover.is-loaded img {
  opacity: 1;
}

.panel-cover.is-failed img {
  display: none;
}

/* 内容 */
.panel-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 36px 40px;
  min-width: 0;
}

.panel-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  line-height: 1;
  min-width: 0;
}

.panel-meta-category {
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--primary-color);
}

.panel-meta-divider {
  color: var(--text-tertiary);
  opacity: 0.5;
}

.panel-meta-date {
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.panel-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
  transition: color 0.25s ease;
}

.panel-title a {
  color: inherit;
}

.panel-desc {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.8;
  color: var(--text-tertiary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.panel-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.panel-tag {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  font-size: 0.75rem;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: auto;
  padding-top: 10px;
}

.panel-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.panel-action:hover {
  color: var(--primary-color);
}

.panel-action.is-primary {
  color: var(--primary-color);
}

.panel-action.is-primary:hover {
  color: var(--text-primary);
}

/* 悬停：封面轻推、标题变色 */
@media (hover: hover) and (pointer: fine) {
  .work-panel:hover {
    border-color: color-mix(in srgb, var(--primary-color) 28%, var(--border-color));
  }

  .work-panel:hover .panel-cover img {
    transform: scale(1.03);
  }

  .work-panel:hover .panel-title {
    color: var(--primary-color);
  }
}

/* 触摸设备无悬停，链接用主题色常驻提示 */
@media (hover: none), (pointer: coarse) {
  .panel-action.is-primary {
    color: var(--primary-color);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-cover,
  .skeleton-line {
    animation: none;
  }

  .panel-cover::before {
    animation: none;
  }

  .panel-cover img {
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
  .work-panel {
    --panel-h: clamp(460px, 56vh, 600px);
  }

  .panel-body {
    padding: 28px 30px;
  }

  .panel-title {
    font-size: 1.375rem;
  }
}

@media (max-width: 680px) {
  .works-page {
    padding: 20px 0 32px;
  }

  /* 移动端保持原来的顶部对齐布局，不做垂直居中 */
  .works-page > .container {
    justify-content: flex-start;
  }

  .work-filter {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    gap: 8px;
    margin: 0 -16px 20px;
    padding: 0 16px 4px;
    scrollbar-width: none;
  }

  .work-filter::-webkit-scrollbar {
    display: none;
  }

  .work-tab {
    max-width: 14em;
    padding: 6px 14px;
    font-size: 0.8125rem;
    flex-shrink: 0;
  }

  .work-panel {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .panel-cover {
    min-height: 0;
    aspect-ratio: 16 / 9;
  }

  .skeleton-cover {
    min-height: 0;
    aspect-ratio: 16 / 9;
  }

  .panel-body {
    padding: 18px 16px 20px;
    gap: 10px;
  }

  .panel-title {
    font-size: 1.125rem;
  }

  .panel-desc {
    -webkit-line-clamp: 4;
  }
}
</style>
