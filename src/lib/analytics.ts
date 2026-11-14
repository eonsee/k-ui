/**
 * 百度统计封装
 *
 * 统计脚本已在 index.html 的 </head> 前引入，全站所有路由共用这一个入口，
 * 因此这里无需重复引入 hm.js，直接在 JS/TS 中通过 _hmt 上报即可。
 */

declare global {
  interface Window {
    _hmt?: unknown[][]
  }
}

function push(command: unknown[]) {
  if (typeof window === 'undefined') return
  // hm.js 未加载完成时先入队，加载后会自动处理
  window._hmt = window._hmt || []
  window._hmt.push(command)
}

/**
 * 上报页面浏览（PV）
 * SPA 路由切换时需手动调用，path 传 to.fullPath
 */
export function trackPageview(path: string) {
  push(['_trackPageview', path])
}

/**
 * 上报自定义事件
 * @example trackEvent('article', 'click', 'article-123')
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number,
) {
  const command: unknown[] = ['_trackEvent', category, action]
  if (label !== undefined) command.push(label)
  if (value !== undefined) command.push(value)
  push(command)
}
