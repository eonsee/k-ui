<template>
  <div
    ref="stageRef"
    class="works-stage"
    @pointerenter="hovered = true"
    @pointerleave="onPointerLeave"
    @pointermove="onPointerMove"
    @focusin="hovered = true"
    @focusout="hovered = false"
  >
    <!-- 接口未返回时显示骨架，避免空白或静态假数据 -->
    <div v-if="showSkeleton" class="works-skeleton" aria-busy="true" aria-label="作品加载中">
      <span v-for="n in 4" :key="n" class="works-skeleton-item"></span>
    </div>

    <!-- 进入宫格时容器不做整体淡入，交给每个格子依次掉落 -->
    <Transition v-else :name="phase === 'marquee' ? 'works-stage' : 'works-grid'" mode="out-in">
      <!-- 横向轮播 -->
      <div v-if="phase === 'marquee'" key="marquee" class="works-marquee" aria-label="产品轮播">
        <div
          v-for="copy in 2"
          :key="copy"
          class="works-marquee-track"
          :aria-hidden="copy > 1"
        >
          <a
            v-for="(work, index) in usableWorks"
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

      <!-- 六宫格：作品多于 6 个时轮流替换 -->
      <div v-else key="grid" class="works-grid" aria-label="作品展示">
        <a
          v-for="(work, index) in slots"
          :key="index"
          :href="work.link || '/works'"
          :target="work.link ? '_blank' : undefined"
          :rel="work.link ? 'noopener noreferrer' : undefined"
          class="works-grid-item"
          :style="tileStyle(index)"
          :title="work.title"
        >
          <span class="works-grid-float">
            <span class="works-grid-card">
              <Transition name="tile-swap">
                <span :key="work.id" class="works-grid-frame">
                  <img :src="work.cover" :alt="work.title" loading="lazy" />
                  <span class="works-grid-overlay">
                    <span class="works-grid-index">No.{{ String(index + 1).padStart(2, '0') }}</span>
                    <span class="works-grid-title">{{ work.title }}</span>
                  </span>
                </span>
              </Transition>
            </span>
          </span>
        </a>
      </div>
    </Transition>

    <!-- 模式开关：开启 = 轮播后转六宫格并轮流换位；关闭 = 保持横向轮播 -->
    <div v-if="usableWorks.length" class="works-stage-footer">
      <button
        type="button"
        class="works-mode-toggle"
        :class="{ 'is-on': enhanced }"
        :aria-pressed="enhanced"
        :title="enhanced ? '关闭六宫格展示，恢复横向轮播' : '开启六宫格展示'"
        @click="enhanced = !enhanced"
      >
        <LayoutGrid :size="12" />
        <span>六宫格</span>
        <span class="works-mode-dot" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { LayoutGrid } from 'lucide-vue-next'
import type { Work } from '@/types'

const props = defineProps<{
  works: Work[]
  loading?: boolean
}>()

// 宫格可展示数量
const PAGE_SIZE = 6
// 横向轮播先“跑一会儿”，再过渡到六宫格
const MARQUEE_LEAD_MS = 4800
// 作品多于 6 个时，每隔一段时间替换一个格子，形成轮流展示
const ROTATE_INTERVAL_MS = 3200
const STORAGE_KEY = 'home.works-grid-mode'

// 没有封面的作品不参与展示
const usableWorks = computed(() => props.works.filter(work => Boolean(work.cover)))

// 首次加载且还没有数据时展示骨架
const showSkeleton = computed(() => Boolean(props.loading) && usableWorks.value.length === 0)

const readPreference = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}

const phase = ref<'marquee' | 'grid'>('marquee')
const enhanced = ref(readPreference())
const reducedMotion = ref(false)
const hovered = ref(false)
const stageRef = ref<HTMLElement | null>(null)

// 当前宫格里的 6 个位置
const slots = ref<Work[]>([])
// 下一个待入场作品的游标
let nextCursor = PAGE_SIZE
// 轮流替换时，下一个要被替换的格子
let slotCursor = 0

let leadTimer: number | undefined
let rotateTimer: number | undefined

const clearTimers = () => {
  if (leadTimer !== undefined) {
    window.clearTimeout(leadTimer)
    leadTimer = undefined
  }
  if (rotateTimer !== undefined) {
    window.clearInterval(rotateTimer)
    rotateTimer = undefined
  }
}

const resetSlots = () => {
  const list = usableWorks.value
  slots.value = list.slice(0, PAGE_SIZE)
  nextCursor = slots.value.length % Math.max(list.length, 1)
  slotCursor = 0
}

// 替换一个格子：从当前未展示的作品中取下一个，保证不会重复
const rotateOne = () => {
  const list = usableWorks.value
  if (list.length <= slots.value.length) return

  const visibleIds = new Set(slots.value.map(work => work.id))
  let incoming: Work | undefined
  for (let step = 0; step < list.length; step++) {
    const index = (nextCursor + step) % list.length
    const candidate = list[index]
    if (!visibleIds.has(candidate.id)) {
      incoming = candidate
      nextCursor = (index + 1) % list.length
      break
    }
  }
  if (!incoming) return

  const target = slotCursor % slots.value.length
  slotCursor = (slotCursor + 1) % slots.value.length
  slots.value = slots.value.map((work, index) => (index === target ? incoming! : work))
}

const startRotation = () => {
  if (rotateTimer !== undefined) {
    window.clearInterval(rotateTimer)
    rotateTimer = undefined
  }
  if (reducedMotion.value) return
  if (usableWorks.value.length <= slots.value.length) return

  rotateTimer = window.setInterval(() => {
    // 悬停或键盘聚焦时暂停换位，方便点击
    if (!hovered.value) rotateOne()
  }, ROTATE_INTERVAL_MS)
}

const enterGrid = () => {
  phase.value = 'grid'
  startRotation()
}

watch(usableWorks, () => {
  resetSlots()
  if (phase.value === 'grid') startRotation()
}, { immediate: true })

watch(enhanced, (on) => {
  try {
    localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
  } catch {
    /* localStorage 不可用时仅本次生效 */
  }

  clearTimers()

  if (!on) {
    // 关闭后回到原有横向轮播
    phase.value = 'marquee'
    return
  }

  if (reducedMotion.value) {
    enterGrid()
    return
  }

  // 重新开启时先播一段轮播，再进入六宫格
  phase.value = 'marquee'
  leadTimer = window.setTimeout(() => {
    leadTimer = undefined
    enterGrid()
  }, MARQUEE_LEAD_MS)
})

onMounted(() => {
  reducedMotion.value =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!enhanced.value) return

  // 用户要求减少动态效果时，直接静态展示宫格
  if (reducedMotion.value) {
    enterGrid()
    return
  }

  leadTimer = window.setTimeout(() => {
    leadTimer = undefined
    enterGrid()
  }, MARQUEE_LEAD_MS)
})

onBeforeUnmount(clearTimers)

// ============ 鼠标视差：六宫格随指针轻微错位移动 ============
const onPointerMove = (event: PointerEvent) => {
  if (reducedMotion.value || event.pointerType === 'touch') return
  const stage = stageRef.value
  if (!stage) return
  const rect = stage.getBoundingClientRect()
  if (!rect.width || !rect.height) return

  stage.style.setProperty('--px', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
  stage.style.setProperty('--py', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
}

const resetParallax = () => {
  const stage = stageRef.value
  if (!stage) return
  stage.style.setProperty('--px', '0')
  stage.style.setProperty('--py', '0')
}

const onPointerLeave = () => {
  hovered.value = false
  resetParallax()
}

// 每格的悬浮参数固定由位置推导，换作品时移动轨迹保持连续
const tileStyle = (index: number): Record<string, string | number> => {
  const tilt = ((index * 37) % 5 - 2) * 0.9
  const depth = 1 + ((index * 29) % 5) * 0.16
  const driftX = ((index * 53) % 19) - 9
  const driftY = -4 - ((index * 31) % 9)
  const duration = 6.4 + ((index * 17) % 5) * 0.9

  return {
    '--tilt': `${tilt.toFixed(1)}deg`,
    '--depth': depth.toFixed(2),
    '--drift-x': `${driftX}px`,
    '--drift-y': `${driftY}px`,
    '--float-dur': `${duration.toFixed(1)}s`,
    // 负延迟让每一格从不同相位开始浮动
    '--float-delay': `${(-(index * 0.83)).toFixed(2)}s`,
    // 逐格依次掉落：一块基本落定，下一块才开始，节奏从容
    '--drop-delay': `${220 + index * 480}ms`,
    '--drop-dur': `${(0.8 + ((index * 13) % 4) * 0.06).toFixed(2)}s`,
  }
}
</script>

<style scoped>
.works-stage {
  position: relative;
  width: 100%;
  --px: 0;
  --py: 0;
}

/* 接口数据未返回时的骨架 */
.works-skeleton {
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  overflow: hidden;
  padding: 16px 0;
  /* 与轮播一致的两侧渐隐 */
  -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 33.333%, #000 66.667%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, #000 33.333%, #000 66.667%, transparent 100%);
}

.works-skeleton-item {
  flex-shrink: 0;
  width: 220px;
  height: 220px;
  border-radius: var(--radius-lg);
  background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--text-tertiary) 10%, var(--bg-secondary)) 25%,
      color-mix(in srgb, var(--text-tertiary) 22%, var(--bg-secondary)) 37%,
      color-mix(in srgb, var(--text-tertiary) 10%, var(--bg-secondary)) 63%
    )
    0 0 / 400% 100%;
  animation: works-skeleton-shimmer 1.4s ease infinite;
}

.works-skeleton-item:nth-child(odd) {
  transform: rotate(-2deg);
}

.works-skeleton-item:nth-child(even) {
  transform: rotate(2deg);
}

@keyframes works-skeleton-shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

/* 模式开关：放在作品下方，作为低调的辅助控件 */
.works-stage-footer {
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.works-mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 6px;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  line-height: 1;
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.2s ease, color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.works-mode-toggle:hover {
  opacity: 1;
  color: var(--text-secondary);
}

.works-mode-toggle:focus-visible {
  opacity: 1;
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.works-mode-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  transition: opacity 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.works-mode-toggle.is-on .works-mode-dot {
  opacity: 1;
  background: var(--primary-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 16%, transparent);
}

/* 阶段切换：轮播 <-> 宫格 */
.works-stage-enter-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.works-stage-leave-active,
.works-grid-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.works-stage-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

.works-stage-leave-to,
.works-grid-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* 进入宫格时容器直接就位，每格自己掉落 */
.works-grid-enter-active {
  transition: none;
}

/* ============ 横向轮播（原有模式） ============ */
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

/* ============ 六宫格 ============ */
.works-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  padding: 22px 0 10px;
}

.works-grid-item {
  flex: 0 0 calc((100% - 32px) / 3);
  aspect-ratio: 1;
  display: block;
  /* 指针视差：不同格子按 depth 产生不同位移 */
  transform: translate3d(
    calc(var(--px) * 18px * var(--depth, 1)),
    calc(var(--py) * 18px * var(--depth, 1)),
    0
  );
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  -webkit-tap-highlight-color: transparent;
}

/* 每格独立的漂浮轨迹，避免整齐划一的“呆板”感 */
.works-grid-float {
  display: block;
  width: 100%;
  height: 100%;
  animation: tile-float var(--float-dur, 7s) ease-in-out infinite;
  animation-delay: var(--float-delay, 0s);
  transform: rotate(var(--tilt, 0deg));
}

@keyframes tile-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(var(--tilt, 0deg));
  }
  50% {
    transform: translate3d(var(--drift-x, 0px), var(--drift-y, -6px), 0) rotate(calc(var(--tilt, 0deg) * -0.7));
  }
}

.works-grid-card {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  box-shadow: var(--shadow-md);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  /* backwards：延迟期间保持不可见，结束后不占用 hover 的 transform */
  animation: tile-drop var(--drop-dur, 0.58s) cubic-bezier(0.3, 0.9, 0.4, 1) backwards;
  animation-delay: var(--drop-delay, 120ms);
}

/* 俄罗斯方块式入场：先显形，再从上方带旋转落下，轻微回弹后落定 */
@keyframes tile-drop {
  0% {
    opacity: 0;
    transform: translate3d(0, -88px, 0) rotate(calc(var(--tilt, 0deg) + 8deg)) scale(0.94);
    /* 加速下坠，更像重力 */
    animation-timing-function: cubic-bezier(0.55, 0.06, 0.68, 0.19);
  }
  /* 快速显形，让“坠落”过程本身可见 */
  18% {
    opacity: 1;
  }
  68% {
    opacity: 1;
    transform: translate3d(0, 6px, 0) rotate(var(--tilt, 0deg)) scale(1.01);
    animation-timing-function: cubic-bezier(0.33, 0, 0.67, 1);
  }
  84% {
    transform: translate3d(0, -3px, 0) rotate(var(--tilt, 0deg)) scale(0.996);
  }
  100% {
    transform: none;
  }
}

.works-grid-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.works-grid-frame {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

/* 轮流换位时的交叉淡入 */
.tile-swap-leave-active {
  position: absolute;
  inset: 0;
}

.tile-swap-enter-active,
.tile-swap-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.tile-swap-enter-from {
  opacity: 0;
  transform: scale(1.06);
}

.tile-swap-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.works-grid-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 26px 12px 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.66), rgba(0, 0, 0, 0));
  color: #ffffff;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.works-grid-index {
  font-family: var(--font-mono);
  font-size: 0.5625rem;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.works-grid-title {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.works-grid-frame:hover .works-grid-overlay,
.works-grid-item:focus-visible .works-grid-overlay {
  opacity: 1;
  transform: none;
}

.works-grid-item:hover .works-grid-card {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-xl);
}

/* 触摸设备没有悬停，标题常驻 */
@media (hover: none), (pointer: coarse) {
  .works-grid-overlay {
    opacity: 0.92;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .works-marquee-track,
  .works-grid-float,
  .works-grid-card,
  .works-skeleton-item {
    animation: none;
  }

  .works-grid-item {
    transition: none;
  }
}

@media (max-width: 768px) {
  .works-marquee-item {
    width: 180px;
    height: 180px;
  }

  .works-skeleton-item {
    width: 180px;
    height: 180px;
  }

  .works-grid {
    gap: 12px;
    padding: 20px 0 8px;
  }

  .works-grid-item {
    flex-basis: calc((100% - 24px) / 3);
  }
}
</style>
