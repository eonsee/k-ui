<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">
            <!-- <span class="gradient-text">mayekkun</span> -->
            <span class="footer-slogan">每一段成长都会有新的热爱</span>
          </router-link>
          <p class="footer-tagline">创造、分享、成长</p>
        </div>

        <div class="footer-links">
          <div class="footer-column">
            <h4 class="footer-title">社交</h4>
            <a href="https://github.com/eonsee" target="_blank" class="footer-link">
              <Github :size="16" />
              GitHub
            </a>
            <!-- <a href="https://gitee.com/mayekun" target="_blank" class="footer-link">
              <Gitee :size="16" />
              Gitee
            </a> -->
            <a href="https://twitter.com" target="_blank" class="footer-link">
              <Twitter :size="16" />
              Twitter
            </a>
            <a href="mailto:hello@mayekun.com" class="footer-link">
              <Mail :size="16" />
              Email
            </a>
          </div>

          <!-- 微信二维码（需要时取消注释）
          <div class="footer-column">
            <h4 class="footer-title">微信</h4>
            <div class="footer-qr">
              <img src="/qr-wechat.png" alt="微信二维码" class="qr-image" />
              <span class="qr-label">扫码添加微信</span>
            </div>
          </div>
          -->

          <!-- QQ二维码 -->
          <div class="footer-column">
            <div class="footer-qr">
              <img src="/qr-qq.png" alt="QQ二维码" class="qr-image" />
              <span class="qr-label">扫码添加QQ</span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
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
        <div class="footer-icp">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            <img src="/icp-logo.png" alt="备案图标" class="icp-logo" width="14" height="14" />
            桂ICP备2024029466号-3
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Github, Twitter, Mail, Activity, Eye } from 'lucide-vue-next'

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
  padding: 48px 0 24px;
}

[data-theme='dark'] .app-footer {
  background: rgba(0, 0, 0, 0.8);
}

.footer-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  gap: 48px;
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.footer-slogan {
  color: #000;
}

[data-theme='dark'] .footer-slogan {
  color: #fff;
}

.footer-tagline {
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: 64px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-title {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--primary-color);
}

.footer-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.qr-image {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  object-fit: cover;
}

.qr-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.copyright,
.domain {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
  margin: 0;
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

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.footer-icp a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
}

.footer-icp a:hover {
  color: var(--primary-color);
}

.icp-logo {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 32px;
  }

  .footer-links {
    gap: 32px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
