<template>
  <!-- Article Found -->
  <div class="article-detail-page" v-if="article">
    <!-- 置顶操作栏：滚动时吸附在网站头部下方 -->
    <div class="article-topbar" :class="{ 'is-stuck': topbarStuck }">
      <div class="container">
        <button class="article-back" type="button" @click="goBack">
          <ArrowLeft :size="16" />
          返回
        </button>

        <div class="article-header-actions">
          <div class="author-info">
            <img :src="myAvatar" :alt="profile.name" class="author-avatar" />
            <div class="author-details">
              <div class="author-name">{{ profile.name }}</div>
              <div class="author-title">发布日期 {{ article.createdAt }}</div>
            </div>
          </div>

          <button class="action-btn" type="button" aria-label="分享" title="分享" @click="shareArticle">
            <Share2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <article class="article-container">
      <!-- Article Header -->
      <header class="article-header">
        <div class="article-header-content">
          <h1 class="article-title">{{ article.title }}</h1>
          <p v-if="showSummary" class="article-summary">{{ article.summary }}</p>
          <div v-if="article.tags.length" class="article-tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <p class="article-copyright">
            本站内容均为原创首发，未经许可，不允许转载。
          </p>
        </div>
      </header>

      <!-- Article Content -->
      <div class="article-content-wrapper">
        <div class="container">
          <div class="article-layout">
            <div class="article-main">
              <div class="article-content" v-html="renderedContent"></div>

              <!-- 上/下一篇：作为正文的一部分，不再单独占一个区域 -->
              <nav v-if="prevArticle || nextArticle" class="article-nav" aria-label="文章导航">
                <router-link
                  v-if="prevArticle"
                  :to="`/article/${prevArticle.id}`"
                  class="article-nav-link prev"
                >
                  <span class="article-nav-label">
                    <ChevronLeft :size="14" />
                    上一篇
                  </span>
                  <span class="article-nav-title">{{ prevArticle.title }}</span>
                </router-link>
                <span v-else class="article-nav-empty" aria-hidden="true"></span>

                <router-link
                  v-if="nextArticle"
                  :to="`/article/${nextArticle.id}`"
                  class="article-nav-link next"
                >
                  <span class="article-nav-label">
                    下一篇
                    <ChevronRight :size="14" />
                  </span>
                  <span class="article-nav-title">{{ nextArticle.title }}</span>
                </router-link>
                <span v-else class="article-nav-empty" aria-hidden="true"></span>
              </nav>
            </div>
          </div>
        </div>
      </div>

    </article>
  </div>

  <!-- Loading -->
  <div v-else-if="articleLoading" class="not-found">
    <div class="container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  </div>

  <!-- Not Found -->
  <div v-else class="not-found">
    <div class="container">
      <FileQuestion :size="64" />
      <h2>文章不存在</h2>
      <p>该文章可能已被删除或移除</p>
      <router-link to="/articles" class="back-btn">
        <ArrowLeft :size="18" />
        返回文章列表
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Share2, FileQuestion, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { useBlogStore } from '@/store'
import type { Article } from '@/types'
import myAvatar from '@/assets/my.jpg'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

// 返回上一页；直接打开链接时回退到文章列表
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/articles')
  }
}

// 文章详情：优先调用后端接口，失败时回退到本地 store
const article = ref<Article | null>(null)
const articleLoading = ref(false)

const loadArticle = async (id: string) => {
  articleLoading.value = true
  try {
    const detail = await blogStore.fetchArticleDetail(id)
    if (detail) {
      article.value = detail
    } else {
      // 接口未返回，回退到本地数据
      article.value = blogStore.getArticleById(id) || null
    }
  } catch (e) {
    console.warn('[ArticleDetail] 获取文章详情失败，使用本地数据', e)
    article.value = blogStore.getArticleById(id) || null
  } finally {
    articleLoading.value = false
  }
}

const topbarStuck = ref(false)

const handleScroll = () => {
  topbarStuck.value = window.scrollY > 8
}

onMounted(() => {
  // 文章页让固定站点头部与吸顶操作栏连成一体，去掉中间的分割线
  document.documentElement.classList.add('article-page')
  loadArticle(route.params.id as string)
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.documentElement.classList.remove('article-page')
  window.removeEventListener('scroll', handleScroll)
})

// 路由变化时重新加载文章并滚动到顶部
watch(() => route.params.id, (newId) => {
  if (newId) {
    window.scrollTo(0, 0)
    loadArticle(newId as string)
  }
})

const profile = computed(() => blogStore.profileData)

const prevNextArticles = computed(() => {
  if (!article.value) return { prev: null, next: null }
  return blogStore.getPrevNextArticles(article.value.id)
})

const prevArticle = computed(() => prevNextArticles.value.prev)
const nextArticle = computed(() => prevNextArticles.value.next)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    let code = str
    if (lang && hljs.getLanguage(lang)) {
      try {
        code = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      } catch (e) {
        console.error(e)
      }
    } else {
      code = md.utils.escapeHtml(str)
    }

    const lines = code.split('\n')
    const linesCode = lines.map((line, i) => {
      return `<span class="code-line"><span class="line-number">${i + 1}</span><span class="line-content">${line}</span></span>`
    }).join('')

    return `<div class="code-block"><div class="code-header"><span class="code-lang">${lang || 'code'}</span><button class="copy-btn" onclick="copyCode(this)">复制</button></div><pre class="hljs"><code>${linesCode}</code></pre></div>`
  }
})

// 为标题添加 id
md.renderer.rules.heading_open = function (tokens, idx) {
  const token = tokens[idx]
  const level = token.tag
  const nextToken = tokens[idx + 1]
  if (nextToken && nextToken.type === 'inline') {
    const text = nextToken.content
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')
    return `<${level} id="${id}">`
  }
  return `<${level}>`
}

// 全局复制函数
;(window as any).copyCode = function(btn: HTMLElement) {
  const codeBlock = btn.closest('.code-block')
  const code = codeBlock?.querySelector('code')
  if (code) {
    const text = code.textContent || ''
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '已复制'
      setTimeout(() => {
        btn.textContent = '复制'
      }, 2000)
    })
  }
}

// 摘要与标题重复时不再展示
const showSummary = computed(() => {
  const current = article.value
  if (!current) return false
  const summary = (current.summary || '').trim()
  const title = (current.title || '').trim()
  return summary.length > 0 && summary !== title
})

// 正文开头常重复一遍标题，渲染前去掉这行 H1
const contentBody = computed(() => {
  const current = article.value
  if (!current) return ''
  const title = (current.title || '').trim()
  return current.content.replace(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/, (match, heading) => {
    return title && String(heading).trim() === title ? '' : match
  })
})

const renderedContent = computed(() => {
  if (!article.value) return ''
  return md.render(contentBody.value)
})

const shareArticle = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value?.title,
      text: article.value?.summary,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}
</script>

<style scoped>
.article-detail-page {
  padding-bottom: 0;
}

/* 文章页隐藏站点头部底部分割线，让吸顶栏与菜单栏连成一体 */
:global(html.article-page .app-header),
:global(html.article-page .app-header.header-scrolled) {
  border-bottom-color: transparent;
}

/* 顶部操作栏：只给左右两块内容做悬浮胶囊，中间不铺背景 */
.article-topbar {
  position: sticky;
  top: 64px;
  z-index: 900;
  height: 64px;
  background: transparent;
  pointer-events: none;
}

.article-topbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  height: 100%;
  pointer-events: none;
}

/* 标题区与正文同宽 */
.article-header {
  width: calc(100% - 48px);
  max-width: 1152px;
  margin: 0 auto;
  padding: 48px;
  text-align: center;
}

.article-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 5px 8px 5px 5px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  pointer-events: auto;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.article-topbar.is-stuck .article-header-actions {
  background: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-color: var(--border-light);
  box-shadow: var(--shadow-sm);
}

[data-theme='dark'] .article-topbar.is-stuck .article-header-actions {
  background: rgba(0, 0, 0, 0.88);
  border-color: var(--border-color);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.author-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  text-align: left;
}

.author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.author-title {
  font-size: 0.6875rem;
  line-height: 1.4;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.article-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  line-height: 1;
  color: var(--text-tertiary);
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.article-topbar.is-stuck .article-back {
  background: rgba(255, 255, 255, 0.9);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-color: var(--border-light);
  box-shadow: var(--shadow-sm);
}

[data-theme='dark'] .article-topbar.is-stuck .article-back {
  background: rgba(0, 0, 0, 0.88);
  border-color: var(--border-color);
}

.article-back svg,
.action-btn svg {
  display: block;
  flex: none;
}

@media (hover: hover) and (pointer: fine) {
  .article-back:hover {
    color: var(--text-primary);
    background: var(--bg-tertiary);
  }
}

.article-header-content {
  width: 100%;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  max-width: 900px;
  margin: 0 auto 16px;
}

.article-summary {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 820px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.article-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.article-content-wrapper {
  padding: 40px 0 24px;
}

.article-layout {
  display: block;
}

.article-main {
  width: 100%;
  min-width: 0;
}

.article-content {
  width: 100%;
  min-width: 0;
  font-size: 0.9375rem;
  overflow-wrap: break-word;
}

/* 正文第一个元素不再叠加顶部外边距，避免与头部之间出现大空隙 */
.article-content :deep(> :first-child) {
  margin-top: 0;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin-top: 30px;
  margin-bottom: 14px;
}

.article-content :deep(h1) {
  font-size: 2rem;
}

.article-content :deep(h2) {
  font-size: 1.5rem;
}

.article-content :deep(h3) {
  font-size: 1.25rem;
}

.article-content :deep(h4) {
  font-size: 1.0625rem;
}

.article-content :deep(p) {
  margin-bottom: 14px;
  line-height: 1.8;
}

/* 代码块样式 */
.article-content :deep(.code-block) {
  margin: 24px 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #1e1e1e;
}

.article-content :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.article-content :deep(.code-lang) {
  font-size: 0.75rem;
  color: #888;
  text-transform: uppercase;
}

.article-content :deep(.copy-btn) {
  padding: 4px 12px;
  font-size: 0.75rem;
  color: #888;
  background: transparent;
  border: 1px solid #444;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.article-content :deep(.copy-btn:hover) {
  color: #fff;
  border-color: #666;
}

.article-content :deep(pre.hljs) {
  margin: 0;
  padding: 16px;
  background: #1e1e1e;
  overflow-x: auto;
}

.article-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
}

.article-content :deep(.code-line) {
  display: block;
  min-height: 1.6em;
}

.article-content :deep(.line-number) {
  display: inline-block;
  width: 40px;
  color: #555;
  text-align: right;
  padding-right: 16px;
  user-select: none;
}

.article-content :deep(.line-content) {
  color: #d4d4d4;
}

/* 行内代码 */
.article-content :deep(code:not(.hljs code)) {
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.article-content :deep(pre) {
  margin: 24px 0;
  border-radius: var(--radius-lg);
  overflow-x: auto;
  max-width: 100%;
}

.article-content :deep(blockquote) {
  margin: 24px 0;
  padding: 16px 24px;
  border-left: 4px solid var(--primary-color);
  background: var(--bg-secondary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
}

.article-content :deep(a) {
  color: var(--primary-color);
  text-decoration: underline;
}

/* 正文图片：限制最大高度，避免大图喧宾夺主 */
.article-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  max-height: 480px;
  margin: 24px auto;
  border-radius: var(--radius-lg);
  object-fit: contain;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: var(--text-tertiary);
  -webkit-tap-highlight-color: transparent;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.action-btn:hover {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}

/* Article Navigation：作为正文末尾的一部分 */
.article-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  gap: 24px;
  margin-top: 32px;
}

.article-nav-link {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 6px 4px;
  border-radius: var(--radius-md);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.article-nav-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  transition: color 0.2s ease;
}

.article-nav-title {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.article-copyright {
  margin: 20px 0 0;
  text-align: center;
  font-size: 0.6875rem;
  line-height: 1.6;
  color: var(--text-tertiary);
}

.article-nav-link.next {
  align-items: flex-end;
  text-align: right;
}

@media (hover: hover) and (pointer: fine) {
  .article-nav-link:hover .article-nav-label,
  .article-nav-link:hover .article-nav-title {
    color: var(--primary-color);
  }
}

@media (hover: none) {
  .article-nav-link:active .article-nav-title {
    color: var(--primary-color);
  }
}

.not-found {
  text-align: center;
  padding: 120px 20px;
  color: var(--text-tertiary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.not-found h2 {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 12px 24px;
  background: var(--primary-gradient);
  color: white;
  border-radius: var(--radius-lg);
  font-weight: 500;
}


@media (max-width: 768px) {
  .article-title {
    font-size: 1.75rem;
  }

  .article-topbar .container {
    gap: 10px;
  }

  .article-header {
    width: calc(100% - 32px);
    padding: 28px 20px;
  }

  .author-avatar {
    width: 30px;
    height: 30px;
  }

  .author-name {
    font-size: 0.8125rem;
  }

  .author-title {
    font-size: 0.625rem;
  }

  .article-nav {
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }

  .article-nav-empty {
    display: none;
  }

  .article-nav-link {
    padding: 0;
  }

  .article-nav-link.prev {
    grid-column: 1;
    grid-row: 1;
  }

  .article-nav-link.next {
    grid-column: 2;
    grid-row: 1;
  }

  .article-copyright {
    margin-top: 16px;
  }

  .article-nav-title {
    white-space: normal;
    font-size: 0.875rem;
  }
}
</style>
