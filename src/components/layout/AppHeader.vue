<template>
  <header
    class="app-header"
    :class="{ 'header-scrolled': isScrolled, 'header-menu-open': isMobileMenuOpen }"
  >
    <div class="container header-container">
      <router-link to="/" class="logo" aria-label="马业坤 — 首页">
        <img :src="logo" alt="Logo" class="logo-image" />
      </router-link>

      <nav class="nav-menu" aria-label="主导航">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
        >
          <span class="nav-link-bubble" aria-hidden="true"></span>
          <span class="nav-link-text">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="header-actions">
        <button
          class="theme-toggle"
          @click="toggleTheme($event)"
          :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
        >
          <Sun v-if="isDark" :size="20" :stroke-width="1.6" />
          <Moon v-else :size="20" :stroke-width="1.6" />
        </button>

        <a
          href="https://github.com/eonsee"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
          aria-label="GitHub"
          title="GitHub"
        >
          <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
        </a>

        <button
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :aria-label="isMobileMenuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-menu"
        >
          <X v-if="isMobileMenuOpen" :size="20" :stroke-width="1.6" />
          <Menu v-else :size="20" :stroke-width="1.6" />
        </button>
      </div>
    </div>
  </header>

  <!-- 移动端全屏菜单：从 header 下方滑下 -->
  <div
    id="mobile-menu"
    class="mobile-menu"
    :class="{ 'is-open': isMobileMenuOpen }"
    :aria-hidden="!isMobileMenuOpen"
    :inert="!isMobileMenuOpen"
  >
    <nav class="mobile-nav" aria-label="移动端导航">
      <router-link
        v-for="(item, index) in menuItems"
        :key="item.path"
        :to="item.path"
        class="mobile-nav-link"
        @click="closeMobileMenu"
      >
        <span class="mobile-nav-index">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="mobile-nav-label">{{ item.name }}</span>
      </router-link>
    </nav>

    <div class="mobile-menu-footer">
      <a href="mailto:hello@mayekun.com" class="mobile-menu-email">hello@mayekun.com</a>
      <span class="mobile-menu-tagline">每一步，都算数</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Sun, Moon, Menu, X } from 'lucide-vue-next'
import logo from '@/assets/logo1.png'

const { isDark, toggleTheme } = inject('theme') as {
  isDark: { value: boolean }
  toggleTheme: (event?: MouseEvent) => void
}

const route = useRoute()

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const menuItems = [
  { name: '首页', path: '/' },
  { name: '文章', path: '/articles' },
  { name: '作品', path: '/works' },
  { name: '关于', path: '/about' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMobileMenu()
}

const handleResize = () => {
  if (window.innerWidth > 768) closeMobileMenu()
}

// 菜单打开时锁定页面滚动
watch(isMobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

// 路由变化时关闭菜单
watch(() => route.path, closeMobileMenu)

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
}

/* 滚动后或菜单展开时：半透明背景 + 毛玻璃 + 底边框 */
.header-scrolled,
.header-menu-open {
  background: rgba(255, 255, 255, 0.88);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-bottom-color: var(--border-color);
}

[data-theme='dark'] .app-header.header-scrolled,
[data-theme='dark'] .app-header.header-menu-open {
  background: rgba(0, 0, 0, 0.88);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 32px;
  width: auto;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-full);
  padding: 6px 14px;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
}

/* 悬停时从中心放大的圆形色块 */
.nav-link-bubble {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 180%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.06);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease-out;
  pointer-events: none;
}

[data-theme='dark'] .nav-link-bubble {
  background: rgba(248, 250, 252, 0.08);
}

.nav-link:hover .nav-link-bubble {
  transform: translate(-50%, -50%) scale(1);
}

.nav-link-text {
  position: relative;
  z-index: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 参考 lodop.fios.top 的图标按钮悬停样式 */
.theme-toggle,
.github-link,
.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid transparent;
  color: var(--text-secondary);
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.theme-toggle:hover,
.github-link:hover,
.mobile-menu-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.github-icon {
  width: 19px;
  height: 19px;
}

.mobile-menu-btn {
  display: none;
}

/* 移动端全屏菜单 */
.mobile-menu {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: none;
  flex-direction: column;
  padding: 8px 24px 32px;
  background: var(--bg-primary);
  overflow-y: auto;
  visibility: hidden;
  transform: translateY(-101%);
  transition: transform 0.5s cubic-bezier(0.76, 0.32, 0.29, 0.99), visibility 0.5s;
}

.mobile-menu.is-open {
  transform: translateY(0);
  visibility: visible;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
}

.mobile-nav-link {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: clamp(1.9rem, 8vw, 2.8rem);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--primary-color);
}

.mobile-nav-index {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: var(--primary-color);
}

.mobile-menu-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: auto;
  padding-top: 32px;
}

.mobile-menu-email {
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.mobile-menu-email:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.mobile-menu-tagline {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }

  .logo-image {
    height: 28px;
  }
}
</style>
