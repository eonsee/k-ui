<template>
  <div class="works-page">
    <div class="container">
      <!-- Growth Timeline -->
      <section class="timeline-section">
        <div class="timeline-body">
          <!-- SVG curved line + 端点文字 -->
          <svg class="timeline-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:0.4" />
              </linearGradient>
              <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.85" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.85" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <!-- 可见的曲线 -->
            <path d="M 0,60 C 100,20 200,100 300,60 C 400,20 500,100 600,60 C 700,20 800,100 900,60 C 1000,20 1100,100 1200,60"
              stroke="url(#lineGrad)" stroke-width="3" fill="none" filter="url(#glow)"/>
          </svg>

          <!-- 开头文字：成长轨迹（固定在画布最左端，曲线下方） -->
          <span class="timeline-end-label timeline-end-label-left">成长轨迹</span>
          <!-- 结尾文字：每一步·都算数（固定在画布最右端，曲线下方） -->
          <span class="timeline-end-label timeline-end-label-right">每一步·都算数</span>

          <div class="timeline-nodes">
            <div
              v-for="(item, index) in timeline"
              :key="item.year"
              class="tl-node"
              :class="{ active: activeNode === index, current: item.isCurrent }"
              @mouseenter="activeNode = index"
              @mouseleave="activeNode = -1"
            >
              <!-- Pulse ring -->
              <div v-if="item.isCurrent" class="pulse-ring"></div>

              <!-- Node icon -->
              <div class="node-icon" :style="{ background: item.color }">
                <svg viewBox="0 0 40 40" width="24" height="24" fill="none" :style="{ color: item.color }" v-html="item.svgPath"></svg>
              </div>

              <!-- Year badge -->
              <div class="node-year-badge" :style="{ borderColor: item.color }">
                <span class="year-text">{{ item.year }}</span>
              </div>

              <!-- Info card -->
              <div class="node-info">
                <div class="info-label" :style="{ color: item.color }">{{ item.label }}</div>
                <div class="info-desc">{{ item.desc }}</div>
                <div v-if="item.achievements.length" class="info-tags">
                  <span v-for="a in item.achievements" :key="a" class="info-tag" :style="{ background: item.color + '14', color: item.color }">{{ a }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Filter -->
      <div class="category-filter">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: currentWorkCategory === category.name }"
          @click="setWorkCategory(category.name)"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Works MindMap + Detail -->
      <div class="works-mindmap" v-if="works.length > 0">
        <!-- 左侧：点位图 -->
        <div class="mindmap-canvas">
          <!-- 背景网格 -->
          <div class="canvas-grid"></div>

          <!-- SVG 连线层 -->
          <svg class="mindmap-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line
              v-for="(line, i) in connectionLines"
              :key="i"
              :x1="line.x1" :y1="line.y1"
              :x2="line.x2" :y2="line.y2"
              class="mindmap-line"
              :class="{ active: line.related }"
            />
          </svg>

          <!-- 点位（真实作品 + 模拟补足点） -->
          <button
            v-for="(node, i) in displayNodes"
            :key="node.id"
            class="mindmap-node"
            :class="{
              active: !node.isMock && selectedId === node.id,
              hovered: hoveredId === node.id,
              mock: node.isMock
            }"
            :style="nodeStyle(node, i)"
            @click="!node.isMock && selectWork(node.id)"
            @mouseenter="hoveredId = node.id"
            @mouseleave="hoveredId = null"
          >
            <span class="node-glow"></span>
            <span class="node-dot"></span>
            <span class="node-label" :class="{ show: !node.isMock && (selectedId === node.id || hoveredId === node.id) }">
              {{ node.title }}
            </span>
          </button>

          <!-- 空状态提示 -->
          <div class="mindmap-empty" v-if="works.length === 0">
            <span>该分类下暂无作品</span>
          </div>
        </div>

        <!-- 右侧：详情面板 -->
        <div class="mindmap-detail">
          <transition name="detail-fade" mode="out-in">
            <div v-if="selectedWork" :key="selectedWork.id" class="detail-card">
              <div class="detail-cover">
                <img :src="selectedWork.cover" :alt="selectedWork.title" loading="lazy" />
                <div class="cover-overlay"></div>
                <span class="cover-category" :style="{ background: categoryColor(selectedWork.category) }">
                  {{ selectedWork.category }}
                </span>
              </div>
              <div class="detail-body">
                <h3 class="detail-title">{{ selectedWork.title }}</h3>
                <p class="detail-desc">{{ selectedWork.description }}</p>
                <div class="detail-tags">
                  <span v-for="tag in selectedWork.tags" :key="tag" class="detail-tag">{{ tag }}</span>
                </div>
                <div class="detail-actions">
                  <a v-if="selectedWork.link" :href="selectedWork.link" target="_blank" class="action-btn primary">
                    <ExternalLink :size="14" />
                    <span>访问</span>
                  </a>
                  <a v-if="selectedWork.github" :href="selectedWork.github" target="_blank" class="action-btn">
                    <Github :size="14" />
                    <span>源码</span>
                  </a>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <span>该分类下暂无作品</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { ExternalLink, Github } from 'lucide-vue-next'
import { useBlogStore } from '@/store'

const blogStore = useBlogStore()
const works = computed(() => blogStore.filteredWorks)
const categories = computed(() => blogStore.workCategories)
const currentWorkCategory = computed(() => blogStore.currentWorkCategory)
const activeNode = ref(-1)

/* ============ 脑力点位图相关 ============ */
const selectedId = ref<string>('')
const hoveredId = ref<string>('')

// 当前选中的作品
const selectedWork = computed(() => {
  if (!selectedId.value) return works.value[0] || null
  return works.value.find(w => w.id === selectedId.value) || works.value[0] || null
})

// 分类颜色映射（按分类名缓存）—— 用于右侧详情卡片
const colorCache = new Map<string, string>()
const palette = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1']
const categoryColor = (category: string): string => {
  if (colorCache.has(category)) return colorCache.get(category)!
  // 同一分类列表里找索引，确保同名分类颜色一致
  const idx = categories.value.findIndex(c => c.name === category)
  const color = palette[idx % palette.length] || palette[0]
  colorCache.set(category, color)
  return color
}

// 点位颜色：按索引循环扩展色板，让每个点都有不同颜色（脑力图五彩斑斓效果）
const nodePalette = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981',
  '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a855f7',
  '#0ea5e9', '#d946ef', '#eab308', '#22c55e', '#f43f5e', '#8b5cf6'
]
const getNodeColor = (index: number): string => {
  return nodePalette[index % nodePalette.length]
}

// 黄金角分布算法：让点位均匀散布在圆形区域内
const getNodePosition = (index: number, total: number) => {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const angle = index * goldenAngle
  // 半径范围 0.15 ~ 0.42，避免太靠中心和边缘
  const t = total > 1 ? index / (total - 1) : 0
  const radius = 0.15 + 0.27 * Math.sqrt(t)
  return {
    x: 50 + Math.cos(angle) * radius * 50,
    y: 50 + Math.sin(angle) * radius * 50
  }
}

// 点位的内联样式（位置 + 按索引分配的颜色，让每个点都不同色）
const nodeStyle = (node: { category: string; isMock?: boolean }, index: number) => {
  const pos = getNodePosition(index, displayNodes.value.length)
  return {
    left: pos.x + '%',
    top: pos.y + '%',
    color: getNodeColor(index)
  }
}

// 显示用的节点列表：真实作品不足 10 个时用模拟点补足
const MIN_NODES = 10
const mockTitlePool = ['待解锁', '构思中', '即将上线', '敬请期待', '开发中', '想法萌芽', '规划中', '设计中']
const displayNodes = computed(() => {
  const real = works.value.map(w => ({
    id: w.id,
    title: w.title,
    category: w.category,
    isMock: false
  }))

  if (real.length >= MIN_NODES || real.length === 0) return real

  const need = MIN_NODES - real.length
  // 模拟点：从已有分类中循环取，让颜色分布均匀
  const categoriesList = categories.value.length > 0
    ? categories.value.map(c => c.name)
    : ['其他']

  const mocks = Array.from({ length: need }, (_, i) => ({
    id: `mock-${i}`,
    title: mockTitlePool[i % mockTitlePool.length],
    category: categoriesList[i % categoriesList.length],
    isMock: true
  }))

  return [...real, ...mocks]
})

// 计算同分类点位之间的连线（包含模拟点）
const connectionLines = computed(() => {
  const list = displayNodes.value
  if (list.length < 2) return []
  const lines: { x1: number; y1: number; x2: number; y2: number; related: boolean }[] = []

  // 按分类分组
  const groups = new Map<string, { index: number; pos: { x: number; y: number } }[]>()
  list.forEach((node, i) => {
    const pos = getNodePosition(i, list.length)
    const arr = groups.get(node.category) || []
    arr.push({ index: i, pos })
    groups.set(node.category, arr)
  })

  // 每个分类内，相邻点位连线
  groups.forEach(arr => {
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i]
      const b = arr[i + 1]
      lines.push({
        x1: a.pos.x, y1: a.pos.y,
        x2: b.pos.x, y2: b.pos.y,
        related: !list[a.index].isMock && (selectedId.value === list[a.index].id || selectedId.value === list[b.index].id)
      })
    }
  })
  return lines
})

// 选中作品
const selectWork = (id: string) => {
  selectedId.value = id
}

// 分类或作品列表变化时，自动选中第一个
watch([() => works.value.length, currentWorkCategory], () => {
  if (works.value.length > 0) {
    selectedId.value = works.value[0].id
  }
})

interface TimelineItem {
  year: number
  label: string
  desc: string
  achievements: string[]
  color: string
  svgPath: string
  isCurrent: boolean
}

// iconType → SVG 路径映射
const iconSvgMap: Record<string, string> = {
  baby: '<circle cx="20" cy="14" r="6" fill="white"/><ellipse cx="20" cy="28" rx="8" ry="6" fill="white"/><circle cx="17" cy="13" r="1" fill="currentColor"/><circle cx="23" cy="13" r="1" fill="currentColor"/><path d="M18 16 Q20 18 22 16" stroke="currentColor" stroke-width="1" fill="none"/>',
  child: '<circle cx="20" cy="11" r="5" fill="white"/><rect x="14" y="18" width="12" height="12" rx="3" fill="white"/><line x1="20" y1="30" x2="20" y2="36" stroke="white" stroke-width="2"/><line x1="16" y1="36" x2="24" y2="36" stroke="white" stroke-width="2"/><circle cx="18" cy="10" r="1" fill="currentColor"/><circle cx="22" cy="10" r="1" fill="currentColor"/><path d="M18 13 Q20 15 22 13" stroke="currentColor" stroke-width="1" fill="none"/>',
  teen: '<circle cx="20" cy="10" r="5" fill="white"/><rect x="13" y="17" width="14" height="13" rx="3" fill="white"/><line x1="17" y1="30" x2="15" y2="37" stroke="white" stroke-width="2"/><line x1="23" y1="30" x2="25" y2="37" stroke="white" stroke-width="2"/><circle cx="18" cy="9" r="1" fill="currentColor"/><circle cx="22" cy="9" r="1" fill="currentColor"/><path d="M18 12 Q20 14 22 12" stroke="currentColor" stroke-width="1" fill="none"/><rect x="25" y="14" width="6" height="8" rx="1" fill="white" opacity="0.7"/>',
  student: '<circle cx="20" cy="10" r="5" fill="white"/><rect x="13" y="17" width="14" height="13" rx="3" fill="white"/><line x1="17" y1="30" x2="15" y2="37" stroke="white" stroke-width="2"/><line x1="23" y1="30" x2="25" y2="37" stroke="white" stroke-width="2"/><rect x="10" y="7" width="20" height="4" rx="2" fill="white" opacity="0.6"/><rect x="14" y="3" width="12" height="5" rx="1" fill="white" opacity="0.5"/><circle cx="18" cy="9" r="1" fill="currentColor"/><circle cx="22" cy="9" r="1" fill="currentColor"/><path d="M18 12 Q20 14 22 12" stroke="currentColor" stroke-width="1" fill="none"/>',
  college: '<circle cx="20" cy="10" r="5" fill="white"/><rect x="13" y="17" width="14" height="13" rx="3" fill="white"/><line x1="17" y1="30" x2="15" y2="37" stroke="white" stroke-width="2"/><line x1="23" y1="30" x2="25" y2="37" stroke="white" stroke-width="2"/><rect x="10" y="7" width="20" height="4" rx="2" fill="white" opacity="0.6"/><circle cx="18" cy="9" r="1" fill="currentColor"/><circle cx="22" cy="9" r="1" fill="currentColor"/><path d="M18 12 Q20 14 22 12" stroke="currentColor" stroke-width="1" fill="none"/><rect x="26" y="20" width="7" height="5" rx="1" fill="white" opacity="0.5"/>',
  worker: '<circle cx="20" cy="10" r="5" fill="white"/><rect x="13" y="17" width="14" height="13" rx="3" fill="white"/><line x1="17" y1="30" x2="15" y2="37" stroke="white" stroke-width="2"/><line x1="23" y1="30" x2="25" y2="37" stroke="white" stroke-width="2"/><rect x="10" y="17" width="3" height="10" rx="1" fill="white" opacity="0.5"/><circle cx="18" cy="9" r="1" fill="currentColor"/><circle cx="22" cy="9" r="1" fill="currentColor"/><path d="M18 12 Q20 14 22 12" stroke="currentColor" stroke-width="1" fill="none"/><rect x="26" y="14" width="7" height="10" rx="1" fill="white" opacity="0.5"/>',
  now: '<circle cx="20" cy="10" r="5" fill="white"/><rect x="13" y="17" width="14" height="13" rx="3" fill="white"/><line x1="17" y1="30" x2="15" y2="37" stroke="white" stroke-width="2"/><line x1="23" y1="30" x2="25" y2="37" stroke="white" stroke-width="2"/><circle cx="18" cy="9" r="1" fill="currentColor"/><circle cx="22" cy="9" r="1" fill="currentColor"/><path d="M18 12 Q20 14 22 12" stroke="currentColor" stroke-width="1" fill="none"/><circle cx="20" cy="10" r="7" stroke="white" stroke-width="1" fill="none" opacity="0.3"/>',
  future: '<circle cx="20" cy="10" r="5" fill="white"/><rect x="13" y="17" width="14" height="13" rx="3" fill="white"/><line x1="17" y1="30" x2="15" y2="37" stroke="white" stroke-width="2"/><line x1="23" y1="30" x2="25" y2="37" stroke="white" stroke-width="2"/><circle cx="18" cy="9" r="1" fill="currentColor"/><circle cx="22" cy="9" r="1" fill="currentColor"/><path d="M18 12 Q20 14 22 12" stroke="currentColor" stroke-width="1" fill="none"/><path d="M28 8 L32 4 L36 8 L32 12 Z" fill="white" opacity="0.5"/><path d="M4 8 L8 4 L12 8 L8 12 Z" fill="white" opacity="0.5"/>',
}

// 默认 mock 数据（接口失败时使用）
const mockTimeline: TimelineItem[] = [
  { year: 2001, label: '诞生', desc: '来到这个世界，开启人生旅程', achievements: [], color: '#f472b6', svgPath: iconSvgMap.baby, isCurrent: false },
  { year: 2006, label: '小学', desc: '踏入校园，启蒙求知之路', achievements: [], color: '#fb923c', svgPath: iconSvgMap.child, isCurrent: false },
  { year: 2014, label: '初中', desc: '初识编程，对计算机产生浓厚兴趣', achievements: ['NOIP 初赛'], color: '#facc15', svgPath: iconSvgMap.teen, isCurrent: false },
  { year: 2017, label: '高中', desc: '深入学习编程，参加信息学竞赛', achievements: ['NOIP 提高组', '省级二等奖'], color: '#4ade80', svgPath: iconSvgMap.student, isCurrent: false },
  { year: 2020, label: '大学', desc: '计算机科学与技术专业，系统学习开发技术', achievements: ['全栈开发', '开源贡献', 'ACM 竞赛'], color: '#3b82f6', svgPath: iconSvgMap.college, isCurrent: false },
  { year: 2024, label: '工作', desc: 'Java 后端开发工程师，参与多个企业级项目', achievements: ['微服务架构', 'Spring Cloud', 'DevOps'], color: '#8b5cf6', svgPath: iconSvgMap.worker, isCurrent: false },
  { year: 2026, label: '现在', desc: '持续深耕技术，积累项目经验', achievements: ['Mayekun Blog', '开源项目'], color: '#ec4899', svgPath: iconSvgMap.now, isCurrent: true },
  { year: 2030, label: '未来', desc: '持续成长，技术赋能业务，创造更多价值', achievements: [], color: '#06b6d4', svgPath: iconSvgMap.future, isCurrent: false },
]

// 优先使用后端数据，失败时 fallback 到 mock
const timeline = computed<TimelineItem[]>(() => {
  const data = blogStore.growthTimelineData
  if (!data || data.length === 0) return mockTimeline
  return data.map((vo) => ({
    year: vo.year,
    label: vo.label || '',
    desc: vo.description || '',
    achievements: vo.achievement ? vo.achievement.split(/[,，、]/).filter(Boolean) : [],
    color: vo.color || '#3b82f6',
    svgPath: iconSvgMap[vo.iconType] || iconSvgMap.now,
    isCurrent: vo.isCurrent === 1,
  }))
})

onMounted(async () => {
  await blogStore.fetchCategories(2)
  blogStore.fetchGrowthTimeline()
  blogStore.fetchWorks()
  // 数据加载后默认选中第一个作品
  setTimeout(() => {
    if (works.value.length > 0 && !selectedId.value) {
      selectedId.value = works.value[0].id
    }
  }, 500)
})

const setWorkCategory = (category: string) => {
  blogStore.setWorkCategory(category)
}
</script>

<style scoped>
.works-page {
  padding: 24px 0 32px;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.works-page > .container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Timeline Section */
.timeline-section {
  margin-bottom: 16px;
}

/* 端点文字：固定在画布左右两端，曲线下方，不会被节点遮挡 */
.timeline-end-label {
  position: absolute;
  top: 100%;
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
  white-space: nowrap;
}

.timeline-end-label-left {
  left: 8px;
}

.timeline-end-label-right {
  right: 8px;
}

[data-theme='dark'] .timeline-end-label {
  color: var(--text-tertiary);
}

/* Timeline Body */
.timeline-body {
  position: relative;
  padding: 0 20px;
}

.timeline-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  pointer-events: none;
  z-index: 0;
}

.timeline-nodes {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  padding: 0 10px;
}

.tl-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding-top: 16px;
  position: relative;
}

/* Pulse ring for current node */
.pulse-ring {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #8b5cf6;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) scale(1.8);
    opacity: 0;
  }
}

/* Node Icon */
.node-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.tl-node.active .node-icon {
  transform: scale(1.2) translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.tl-node.current .node-icon {
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
}

/* Year Badge */
.node-year-badge {
  margin-top: 8px;
  padding: 2px 10px;
  border-radius: 20px;
  border: 1.5px solid;
  background: var(--bg-primary);
  transition: all 0.35s ease;
}

.year-text {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.tl-node.active .node-year-badge {
  background: var(--bg-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Info Card */
.node-info {
  margin-top: 8px;
  padding: 10px 10px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  text-align: center;
  width: 130px;
  opacity: 0.5;
  transform: translateY(6px) scale(0.96);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.tl-node.active .node-info {
  opacity: 1;
  transform: translateY(0) scale(1);
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
}

.tl-node.current .node-info {
  opacity: 1;
  transform: translateY(0) scale(1);
  border-color: #8b5cf6;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.12);
}

.info-label {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.info-desc {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.info-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.625rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  justify-content: center;
}

.category-tab {
  padding: 8px 20px;
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

/* Works MindMap */
.works-mindmap {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  /* 两列同高，由内容（详情卡片）决定 */
  align-items: stretch;
  min-height: 0;
  flex: 0 0 auto;
}

/* 点位图画布 */
.mindmap-canvas {
  position: relative;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  /* 高度等于同行 detail 卡片高度，不超出 */
  height: 100%;
  min-height: 0;
}

.canvas-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

[data-theme='dark'] .canvas-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}

/* 连线层 */
.mindmap-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mindmap-line {
  stroke: rgba(59, 130, 246, 0.15);
  stroke-width: 0.3;
  stroke-dasharray: 1 1;
  transition: stroke 0.3s ease;
}

.mindmap-line.active {
  stroke: rgba(59, 130, 246, 0.6);
  stroke-width: 0.5;
  stroke-dasharray: none;
}

/* 点位 */
.mindmap-node {
  position: absolute;
  transform: translate(-50%, -50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  z-index: 2;
  width: 12px;
  height: 12px;
  display: block;
}

.node-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .node-dot {
  box-shadow: 0 0 0 3px rgba(15, 15, 26, 0.9), 0 2px 6px rgba(0, 0, 0, 0.3);
}

.node-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0;
  filter: blur(6px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.mindmap-node.hovered .node-dot {
  transform: scale(1.4);
}

.mindmap-node.hovered .node-glow {
  opacity: 0.8;
  width: 24px;
  height: 24px;
}

.mindmap-node.active .node-dot {
  transform: scale(1.5);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.9), 0 0 0 7px currentColor, 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mindmap-node.active .node-glow {
  opacity: 1;
  width: 32px;
  height: 32px;
  animation: nodePulse 2s ease-out infinite;
}

@keyframes nodePulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

/* 点位标签（绝对定位，不占据 button 空间，避免误触相邻点位） */
.node-label {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) translateX(-4px);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  white-space: nowrap;
  opacity: 0;
  transition: all 0.25s ease;
  pointer-events: none;
}

.node-label.show {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.mindmap-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.mindmap-node.mock {
  cursor: default;
  width: 8px;
  height: 8px;
}

.mindmap-node.mock .node-dot {
  width: 8px;
  height: 8px;
  opacity: 0.4;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
}

[data-theme='dark'] .mindmap-node.mock .node-dot {
  box-shadow: 0 0 0 2px rgba(15, 15, 26, 0.9);
}

.mindmap-node.mock.hovered .node-dot {
  transform: scale(1.3);
  opacity: 0.7;
}

.mindmap-node.mock.hovered .node-glow {
  opacity: 0.4;
  width: 18px;
  height: 18px;
}

.mindmap-node.mock .node-label {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  font-style: italic;
  opacity: 0;
}

.mindmap-node.mock.hovered .node-label {
  opacity: 0.8;
  transform: translateY(-50%) translateX(0);
}

/* 详情面板 */
.mindmap-detail {
  min-width: 0;
}

.detail-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  overflow: hidden;
  /* 高度完全由内容决定，描述多长就多高 */
  display: flex;
  flex-direction: column;
  align-self: start;
}

.detail-cover {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-secondary);
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.detail-card:hover .detail-cover img {
  transform: scale(1.05);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
}

.cover-category {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  color: white;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.detail-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 不再 flex:1，让 body 高度由内容自然撑开 */
}

.detail-title {
  font-family: var(--font-body);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.detail-desc {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  line-height: 1.7;
  margin: 0;
  /* 不再强制截断，让描述自然撑开，详情卡片高度随内容自适应 */
  word-break: break-word;
  white-space: pre-wrap;
}

.detail-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.detail-tag {
  padding: 3px 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.primary:hover {
  background: var(--primary-dark, #2563eb);
  color: white;
}

/* 详情切换动画 */
.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: all 0.3s ease;
}

.detail-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.detail-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .works-mindmap {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .works-page {
    padding: 16px 0 24px;
  }

  .works-mindmap {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .timeline-svg {
    height: 60px;
  }

  .tl-node {
    padding-top: 24px;
  }

  .node-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .node-info {
    width: 110px;
    padding: 10px 8px;
  }

  .info-desc {
    display: none;
  }

  .pulse-ring {
    width: 40px;
    height: 40px;
    top: 18px;
  }

  .category-filter {
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 6px;
    margin: 0 -16px 24px;
    padding: 0 16px 8px;
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

  .detail-body {
    padding: 16px;
  }

  .detail-title {
    font-size: 1.125rem;
  }

  .node-label {
    display: none;
  }
}

@media (max-width: 480px) {
  .timeline-nodes {
    padding: 0 4px;
  }

  .node-info {
    width: 90px;
    padding: 8px 4px;
  }

  .info-label {
    font-size: 0.8125rem;
  }

  .node-year-badge {
    padding: 1px 8px;
  }

  .year-text {
    font-size: 0.6875rem;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}
</style>
