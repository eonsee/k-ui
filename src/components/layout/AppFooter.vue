<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <!-- 左：社交 -->
      <div class="footer-social">
        <a
          href="https://github.com/eonsee"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="GitHub"
          title="GitHub"
        >
          <Github :size="15" />
        </a>
        <a
          href="https://gitee.com/mayekun"
          target="_blank"
          rel="noopener noreferrer"
          class="social-btn"
          aria-label="Gitee"
          title="Gitee"
        >
          <svg class="social-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z" />
          </svg>
        </a>
        <a href="mailto:info@mayekun.com" class="social-btn" aria-label="Email" title="Email">
          <Mail :size="15" />
        </a>
      </div>

      <!-- 中间：ICP 备案 -->
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-icp"
      >
        <img src="/icp-logo.png" alt="备案图标" class="icp-logo" width="14" height="14" />
        桂ICP备2024029466号-3
      </a>

      <!-- 版权与站点统计 -->
      <p class="footer-meta">
        <span>© {{ currentYear }} 马业坤</span>
        <span class="footer-separator" aria-hidden="true">·</span>
        <span class="site-stat-inline">
          <Activity :size="12" :stroke-width="1.8" aria-hidden="true" />
          已运行 <strong>{{ runningDays }}</strong> 天
        </span>
        <span class="footer-separator" aria-hidden="true">·</span>
        <span class="site-stat-inline">
          <Eye :size="12" :stroke-width="1.8" aria-hidden="true" />
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
  padding: 14px 0;
}

[data-theme='dark'] .app-footer {
  background: rgba(0, 0, 0, 0.8);
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

/* 圆形社交按钮 */
.footer-social {
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-svg {
  width: 15px;
  height: 15px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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

/* ICP 备案链接 */
.footer-icp {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

@media (hover: hover) and (pointer: fine) {
  .footer-icp:hover {
    color: var(--primary-color);
  }
}

.icp-logo {
  width: 14px;
  height: 14px;
}

/* 版权与站点统计 */
.footer-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px 8px;
  margin: 0;
  font-size: 0.75rem;
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
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-weight: 500;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 14px 0 16px;
  }

  .footer-container {
    gap: 8px;
  }

  .social-btn {
    width: 30px;
    height: 30px;
  }

  .footer-meta {
    justify-content: center;
    gap: 4px 10px;
    font-size: 0.6875rem;
  }

  .footer-separator {
    display: none;
  }
}
</style>
