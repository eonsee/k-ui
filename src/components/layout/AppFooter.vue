<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <!-- 第一行：社交 -->
      <div class="footer-social">
        <a
          href="https://github.com/eonsee"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="GitHub"
          title="GitHub"
        >
          <Github :size="18" />
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="X"
          title="X"
        >
          <svg class="social-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
          </svg>
        </a>
        <a href="mailto:info@mayekun.com" class="social-btn" aria-label="Email" title="Email">
          <Mail :size="18" />
        </a>
      </div>

      <!-- 第二行：ICP 备案 -->
      <div class="footer-icp">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          <img src="/icp-logo.png" alt="备案图标" class="icp-logo" width="14" height="14" />
          桂ICP备2024029466号-3
        </a>
      </div>

      <!-- 第三行：版权信息 -->
      <p class="footer-meta">
        © {{ currentYear }} 马业坤 版权所有
        <span class="footer-separator">|</span>
        <span class="site-stat-inline">
          <Activity :size="14" :stroke-width="1.8" aria-hidden="true" />
          本站已健康运行 <strong>{{ runningDays }}</strong> 天
        </span>
        <span class="footer-separator">|</span>
        <span class="site-stat-inline">
          <Eye :size="14" :stroke-width="1.8" aria-hidden="true" />
          访问量 <strong>{{ visitCount.toLocaleString() }}</strong>
        </span>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Github, Mail, Activity, Eye } from 'lucide-vue-next'

// 网站开始运行的时间（YYYY-MM-DD）
const SITE_START_DATE = '2024-01-01'

const currentYear = ref(new Date().getFullYear())
const runningDays = ref(1)
// 访问量暂无统计接口，先用静态数据占位
const visitCount = ref(12864)
let timer: ReturnType<typeof setInterval> | null = null

const updateRunningDays = () => {
  const now = new Date()
  const start = new Date(SITE_START_DATE)
  const diff = now.getTime() - start.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  runningDays.value = days > 0 ? days : 1
  currentYear.value = now.getFullYear()
}

onMounted(() => {
  updateRunningDays()
  // 每分钟检查一次，确保跨过午夜时天数自动 +1
  timer = setInterval(updateRunningDays, 60 * 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.app-footer {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-color);
  padding: 40px 0 28px;
}

[data-theme='dark'] .app-footer {
  background: rgba(0, 0, 0, 0.8);
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

/* 第一行：圆形社交按钮 */
.footer-social {
  display: flex;
  align-items: center;
  gap: 12px;
}

.social-svg {
  width: 17px;
  height: 17px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  color: var(--text-secondary);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

@media (hover: hover) and (pointer: fine) {
  .social-btn:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
    transform: translateY(-2px);
  }
}

@media (hover: none) {
  .social-btn:active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
  }
}

/* 第二行：ICP */
.footer-icp a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

@media (hover: hover) and (pointer: fine) {
  .footer-icp a:hover {
    color: var(--primary-color);
  }
}

.icp-logo {
  width: 14px;
  height: 14px;
}

/* 第三行：版权与站点统计 */
.footer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.footer-separator {
  color: var(--border-color);
}

.site-stat-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.site-stat-inline svg {
  flex-shrink: 0;
}

.site-stat-inline strong {
  color: var(--primary-color);
  font-family: var(--font-mono);
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 32px 0 24px;
  }

  .footer-container {
    gap: 16px;
  }

  .social-btn {
    width: 38px;
    height: 38px;
  }

  .footer-meta {
    gap: 6px;
    font-size: 0.75rem;
  }

  .footer-separator {
    display: none;
  }
}
</style>
