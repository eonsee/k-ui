<template>
  <div class="ip-detail-card">
    <div v-if="loading" class="ip-loading">
      <div class="loading-spinner"></div>
      <span>正在获取访客信息...</span>
    </div>

    <div v-else-if="ipInfo" class="ip-content">
      <!-- IP 段 -->
      <div class="ip-row">
        <div class="ip-label">IP</div>
        <div class="ip-value ip-address">
          <a :href="`https://ippure.com?q=${ipInfo.ip}`" target="_blank" rel="noopener noreferrer">
            {{ ipInfo.ip }}
          </a>
          <span class="ip-actions">
            <button class="ip-icon-btn" :title="copied ? '已复制' : '复制'" @click="copyIp">
              <Check v-if="copied" :size="14" />
              <Copy v-else :size="14" />
            </button>
            <button class="ip-icon-btn" title="详细信息" @click="openDetail">
              <ExternalLink :size="14" />
            </button>
          </span>
        </div>
      </div>

      <!-- ASN 段 -->
      <div class="ip-row asn-row">
        <div class="ip-label">ASN</div>
        <div class="ip-value asn-value">
          <a :href="`https://ippure.com/asn/${ipInfo.asn}`" target="_blank" rel="noopener noreferrer" class="asn-link">
            AS{{ ipInfo.asn }} - {{ ipInfo.asOrganization }}
          </a>
        </div>
      </div>

      <!-- 位置段 -->
      <div class="ip-row location-row">
        <div class="ip-label">位置</div>
        <div class="ip-value location-value">
          <div class="location-flag">
            <span class="flag-dot" :style="{ background: flagColor }"></span>
            <span class="flag-text">{{ locationText }}</span>
          </div>
        </div>
      </div>

      <!-- 风险系数段 -->
      <div class="ip-row risk-row" v-if="ipInfo.fraudScore !== undefined">
        <div class="ip-label">风险系数</div>
        <div class="ip-value risk-value">
          <div class="risk-bar-wrapper">
            <div class="risk-bar">
              <div class="risk-bar-fill" :style="{ width: ipInfo.fraudScore + '%', background: riskColor }"></div>
            </div>
            <div class="risk-marks">
              <span>0</span>
              <span>15</span>
              <span>25</span>
              <span>40</span>
              <span>50</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
          <div class="risk-tooltip" :style="{ left: ipInfo.fraudScore + '%', background: riskColor }">
            <span>{{ ipInfo.fraudScore }}% {{ riskLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 时区段 -->
      <div class="ip-row" v-if="ipInfo.timezone">
        <div class="ip-label">时区</div>
        <div class="ip-value">{{ ipInfo.timezone }}</div>
      </div>
    </div>

    <div v-else class="ip-error">
      <span>无法获取访客信息</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Copy, Check, ExternalLink } from 'lucide-vue-next'

interface IPInfo {
  ip: string
  asn: number
  asOrganization: string
  country: string
  countryCode: string
  region: string
  regionCode: string
  city: string
  timezone: string
  longitude: string
  latitude: string
  postalCode: string
  fraudScore?: number
  isResidential?: boolean
  isBroadcast?: boolean
  userAgent: string
}

const ipInfo = ref<IPInfo | null>(null)
const loading = ref(true)
const copied = ref(false)

const locationText = computed(() => {
  if (!ipInfo.value) return ''
  const parts = [ipInfo.value.country, ipInfo.value.region, ipInfo.value.city].filter(Boolean)
  return parts.join(', ')
})

// 根据国家代码返回旗帜颜色（简化版）
const flagColor = computed(() => {
  if (!ipInfo.value) return '#94a3b8'
  const code = ipInfo.value.countryCode
  // 简单的颜色映射
  const map: Record<string, string> = {
    CN: '#ef4444',
    US: '#3b82f6',
    JP: '#f43f5e',
    HK: '#ef4444',
    TW: '#22c55e',
    SG: '#ef4444',
    KR: '#10b981',
    GB: '#3b82f6',
    DE: '#facc15',
    FR: '#3b82f6',
  }
  return map[code] || '#94a3b8'
})

// 风险系数颜色（红→橙→黄→绿）
const riskColor = computed(() => {
  const score = ipInfo.value?.fraudScore
  if (score === undefined) return '#94a3b8'
  if (score < 15) return '#22c55e' // 绿 - 极纯净
  if (score < 25) return '#84cc16' // 浅绿
  if (score < 40) return '#eab308' // 黄
  if (score < 70) return '#f97316' // 橙
  return '#ef4444' // 红
})

// 风险系数描述
const riskLabel = computed(() => {
  const score = ipInfo.value?.fraudScore
  if (score === undefined) return ''
  if (score < 15) return '极度纯净'
  if (score < 25) return '纯净'
  if (score < 40) return '一般'
  if (score < 70) return '风险较高'
  return '高风险'
})

const copyIp = async () => {
  if (!ipInfo.value) return
  try {
    await navigator.clipboard.writeText(ipInfo.value.ip)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch (e) {
    // 静默失败
  }
}

const openDetail = () => {
  if (ipInfo.value) {
    window.open(`https://ippure.com?q=${ipInfo.value.ip}`, '_blank')
  }
}

onMounted(async () => {
  try {
    const res = await fetch('https://my.ippure.com/v1/info')
    if (!res.ok) throw new Error('请求失败: ' + res.status)
    ipInfo.value = await res.json()
  } catch (e) {
    ipInfo.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ip-detail-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: 20px 24px;
  height: 100%;
  font-size: 0.8125rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ip-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  justify-content: center;
  flex: 1;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ip-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.ip-row {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 12px;
  align-items: start;
}

.ip-label {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  font-weight: 500;
  text-align: right;
  padding-top: 2px;
}

.ip-value {
  color: var(--text-primary);
  font-size: 0.8125rem;
  word-break: break-all;
}

.ip-address {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ip-address a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.ip-address a:hover {
  text-decoration: underline;
}

.ip-actions {
  display: flex;
  gap: 4px;
}

.ip-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-tertiary);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ip-icon-btn:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.asn-row {
  border-top: 1px dashed var(--border-light);
  padding-top: 10px;
}

.asn-value .asn-link {
  color: var(--primary-color);
  text-decoration: none;
}

.asn-value .asn-link:hover {
  text-decoration: underline;
}

.location-row {
  border-top: 1px dashed var(--border-light);
  padding-top: 10px;
}

.location-value {
  display: flex;
  align-items: center;
}

.location-flag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.flag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.flag-text {
  color: var(--text-primary);
}

.risk-row {
  border-top: 1px dashed var(--border-light);
  padding-top: 10px;
  flex: 1;
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 12px;
  align-items: start;
}

.risk-value {
  position: relative;
  padding-top: 16px;
}

.risk-bar-wrapper {
  position: relative;
}

.risk-bar {
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #22c55e 0%, #84cc16 15%, #eab308 25%, #f97316 50%, #ef4444 100%);
  border-radius: 2px;
  position: relative;
  overflow: visible;
}

.risk-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 2px;
  background: transparent;
}

.risk-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 0.625rem;
  color: var(--text-tertiary);
}

.risk-tooltip {
  position: absolute;
  top: -8px;
  transform: translateX(-50%);
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  font-size: 0.625rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.risk-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: inherit;
}

.ip-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
  flex: 1;
}
</style>
