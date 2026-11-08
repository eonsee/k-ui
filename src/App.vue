<template>
  <a-config-provider :theme="antdTheme">
    <div class="app-container" :class="{ 'dark-mode': isDark }">
      <AppHeader />
      <main class="main-content" :class="{ 'main-content--home': route.path === '/' }">
        <router-view />
      </main>
      <AppFooter />
      <!-- 对联 - 暂时关闭 -->
      <!-- <Couplet v-if="showCouplet" /> -->
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, provide, computed, watchEffect, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { theme as antdThemeFunc } from 'ant-design-vue'
import { useBlogStore } from '@/store'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import Couplet from '@/components/common/Couplet.vue'

const route = useRoute()
const blogStore = useBlogStore()

const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved === 'dark'
  } catch {
    // localStorage 不可用时回退到系统偏好
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialTheme())

document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')

const showCouplet = computed(() => {
  return route.path !== '/'
})

// 主题切换：参考 chendahuang.com，用 View Transitions 从点击位置圆形扩散
const toggleTheme = (event?: MouseEvent) => {
  const next = !isDark.value

  const commit = () => {
    isDark.value = next
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // 忽略隐私模式等场景下的存储异常
    }
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!event || !document.startViewTransition || reduceMotion) {
    commit()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  document.documentElement.classList.add('theme-switching')

  const transition = document.startViewTransition(async () => {
    commit()
    await nextTick()
  })

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'cubic-bezier(.76,.32,.29,.99)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
    .catch(() => {})

  transition.finished
    .catch(() => {})
    .finally(() => {
      document.documentElement.classList.remove('theme-switching')
    })
}

// 季节对应的 Ant Design 主色
const seasonColors: Record<string, string> = {
  spring: '#22c55e',
  summer: '#06b6d4',
  autumn: '#f97316',
  winter: '#6366f1',
}

// 监听季节变化，切换主题色
watchEffect(() => {
  document.documentElement.setAttribute('data-season', blogStore.currentSeason)
})

// Ant Design 动态主题
const antdTheme = computed(() => ({
  algorithm: isDark.value ? antdThemeFunc.darkAlgorithm : antdThemeFunc.defaultAlgorithm,
  token: {
    colorPrimary: seasonColors[blogStore.currentSeason] || '#3b82f6',
    ...(isDark.value
      ? {
          colorBgBase: '#000000',
          colorBgContainer: '#0d0d0d',
          colorBgElevated: '#141414',
        }
      : {}),
  },
}))

provide('theme', { isDark, toggleTheme })
</script>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.main-content {
  flex: 1;
  padding-top: 64px;
}

/* 首页 Hero 延伸到导航栏下方，让透明导航浮在内容之上 */
.main-content--home {
  padding-top: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
