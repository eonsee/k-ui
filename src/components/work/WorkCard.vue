<template>
  <div class="work-card" :class="{ active }" @click="$emit('select')">
    <!-- 左侧：大封面 -->
    <div class="card-cover">
      <img :src="work.cover" :alt="work.title" loading="lazy" />
      <div class="cover-mask"></div>
      <div class="cover-index">No.{{ String(index ?? 0).padStart(2, '0') }}</div>
    </div>

    <!-- 右侧：信息 -->
    <div class="card-body">
      <div class="body-head">
        <span class="body-category">{{ work.category }}</span>
        <span class="body-divider">/</span>
        <span class="body-date">{{ formatDate(work.createdAt) }}</span>
      </div>

      <h3 class="body-title">{{ work.title }}</h3>
      <p class="body-desc">{{ work.description }}</p>

      <div class="body-tags">
        <span v-for="tag in work.tags.slice(0, 3)" :key="tag" class="body-tag">
          <span class="tag-dot"></span>{{ tag }}
        </span>
      </div>

      <div class="body-actions">
        <a v-if="work.link" :href="work.link" target="_blank" class="action-link" @click.stop>
          <ExternalLink :size="14" />
          <span>访问</span>
        </a>
        <a v-if="work.github" :href="work.github" target="_blank" class="action-link" @click.stop>
          <Github :size="14" />
          <span>源码</span>
        </a>
        <span class="action-arrow">
          <ArrowUpRight :size="16" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ExternalLink, Github, ArrowUpRight } from 'lucide-vue-next'
import type { Work } from '@/types'

defineProps<{
  work: Work
  active?: boolean
  index?: number
}>()

defineEmits<{
  select: []
}>()

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
</script>

<style scoped>
.work-card {
  display: grid;
  grid-template-columns: 280px 1fr;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  cursor: pointer;
  position: relative;
}

.work-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.12);
}

/* 左侧封面 */
.card-cover {
  position: relative;
  overflow: hidden;
  background: var(--bg-secondary);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.work-card:hover .card-cover img {
  transform: scale(1.08);
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.25) 100%);
  pointer-events: none;
}

.cover-index {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}

[data-theme='dark'] .cover-index {
  background: rgba(0, 0, 0, 0.85);
  color: var(--text-primary);
}

/* 右侧内容 */
.card-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.body-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.body-category {
  color: var(--primary-color);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.body-divider {
  opacity: 0.4;
}

.body-date {
  font-variant-numeric: tabular-nums;
}

.body-title {
  font-family: var(--font-body);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-fast);
}

.work-card:hover .body-title {
  color: var(--primary-color);
}

.body-desc {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.body-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.body-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
}

.body-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 8px;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  transition: color var(--transition-fast);
  text-decoration: none;
}

.action-link:hover {
  color: var(--primary-color);
}

.action-arrow {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.work-card:hover .action-arrow {
  background: var(--primary-color);
  color: white;
  transform: rotate(-15deg);
}

.work-card.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

/* 响应式 */
@media (max-width: 768px) {
  .work-card {
    grid-template-columns: 140px 1fr;
  }

  .card-body {
    padding: 16px;
    gap: 8px;
  }

  .body-title {
    font-size: 1rem;
  }

  .body-desc {
    font-size: 0.75rem;
  }

  .body-tags {
    display: none;
  }

  .action-link span {
    display: none;
  }

  .cover-index {
    top: 8px;
    left: 8px;
    font-size: 0.625rem;
    padding: 2px 8px;
  }
}

@media (max-width: 480px) {
  .work-card {
    grid-template-columns: 1fr;
  }

  .card-cover {
    aspect-ratio: 16 / 9;
  }
}
</style>
