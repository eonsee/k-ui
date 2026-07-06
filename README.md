# 马业坤个人博客前端 (mayekun-ui)

> 全栈开发者 / 技术博主的个人博客前端。基于 **Vue 3 + TypeScript + Vite + Pinia** 构建，配套后端 API 服务 `api.mayekun.com`。

🌐 在线地址：[https://mayekun.com](https://mayekun.com)
🛠 技术栈：Vue 3 · TypeScript · Vite 5 · Pinia · Vue Router 4 · Axios · TailwindCSS

---

## 📑 目录

- [项目简介](#-项目简介)
- [核心功能](#-核心功能)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [环境配置](#-环境配置)
- [快速开始](#-快速开始)
- [路由与页面](#-路由与页面)
- [状态管理 (Pinia)](#-状态管理-pinia)
- [核心组件](#-核心组件)
- [API 请求封装](#-api-请求封装)
- [特色功能详解](#-特色功能详解)
- [SEO 与部署](#-seo-与部署)
- [开发约定](#-开发约定)
- [待优化项 / Known Issues](#-待优化项--known-issues)
- [License](#-license)

---

## 📌 项目简介

`mayekun-ui` 是博客 [mayekun.com](https://mayekun.com) 的前端工程，承载个人主页、文章系统、作品集、关于页等功能。

- 🎨 **设计风格**：现代简约、毛玻璃质感、响应式布局（桌面 / 平板 / 手机）
- 🌗 **暗色模式**：跟随系统 / 手动切换
- 🇨🇳 **中文界面**：本土化文案与设计
- ⚡ **性能优先**：路由懒加载、Vite 构建、相对路径代理避免 CORS

## ✨ 核心功能

| 模块 | 功能点 |
|------|--------|
| **首页** | 个人简介、统计图表、最新文章卡片 |
| **文章列表** | 分类筛选、关键词搜索、分页、热力图（四季/二十四节气双模式）、IP 信息卡片 |
| **文章详情** | Markdown 渲染、代码高亮、文章目录 (TOC)、自动滚动阅读、悬浮音乐播放器 |
| **作品集** | 分类筛选、**脑力点位图**（左侧点位网络 + 右侧详情卡片）、成长轨迹时间轴 |
| **关于页** | 个人介绍、技能图谱、二维码、成长故事 |
| **通用** | 顶部导航、底部信息、QQ / 微信二维码、备案号、运行天数实时统计 |

## 🧰 技术栈

### 核心框架
- **Vue 3.4** —— Composition API + `<script setup>`
- **TypeScript 5.3** —— 全量类型约束
- **Vite 5** —— 构建工具 + Dev Server
- **Pinia 2** —— 状态管理
- **Vue Router 4** —— SPA 路由

### UI / 工具
- **TailwindCSS 3** + **less** —— 样式
- **lucide-vue-next** —— 图标库
- **markdown-it** + **highlight.js** —— Markdown 渲染与代码高亮
- **ant-design-vue** —— 部分交互组件（如有）
- **clsx** + **tailwind-merge** —— class 合并工具

### HTTP
- **axios** —— 请求库，统一封装在 `src/api/request.ts`

## 📂 项目结构

```
mayekun-ui/
├── public/                          # 静态资源（直接拷贝到 dist 根目录）
│   ├── favicon.png / favicon.svg    # 网站图标
│   ├── my.jpg                       # og:image 社交分享图
│   ├── qr-qq.png / qr-wechat.png    # 联系方式二维码
│   └── ...
├── src/
│   ├── api/                         # 接口请求层
│   │   ├── request.ts               # axios 实例与拦截器
│   │   ├── article.ts               # 文章相关 API
│   │   ├── category.ts              # 分类 API
│   │   ├── work.ts                  # 作品 API
│   │   ├── profile.ts               # 个人简介 API
│   │   ├── growth.ts                # 成长时间轴 API
│   │   └── skill.ts                 # 技能 API
│   ├── assets/                      # 业务图片资源
│   ├── components/
│   │   ├── article/                 # 文章相关组件
│   │   │   ├── ArticleCard.vue      # 文章卡片
│   │   │   ├── ActivityHeatmap.vue  # 文章活跃度热力图（四季/节气）
│   │   │   ├── IPCard.vue           # 访客 IP 卡片（图片版）
│   │   │   ├── IPDetailCard.vue     # 访客 IP 详情卡片（API 版）
│   │   │   ├── ArticleToc.vue       # 文章目录
│   │   │   ├── AutoReader.vue       # 自动滚动阅读
│   │   │   ├── FloatingMusicPlayer.vue / MusicPlayer.vue
│   │   │   └── SeasonTree.vue       # 四季树（历史遗留）
│   │   ├── layout/                  # 布局组件
│   │   │   ├── AppHeader.vue        # 顶部导航
│   │   │   └── AppFooter.vue        # 底部信息
│   │   ├── work/WorkCard.vue        # 作品卡片（备用，新版已用脑力点位图）
│   │   ├── home/StatsChart.vue      # 首页统计图表
│   │   └── common/Couplet.vue       # 春联动画
│   ├── composables/
│   │   └── useTheme.ts              # 主题切换逻辑
│   ├── lib/utils.ts                 # 通用工具函数
│   ├── mock/data.ts                 # 本地 mock 数据（接口异常时降级）
│   ├── router/index.ts              # 路由配置
│   ├── store/index.ts               # Pinia 主仓库（含二十四节气配置）
│   ├── types/index.ts               # 全局类型定义
│   ├── views/                       # 页面
│   │   ├── Home.vue                 # 首页
│   │   ├── Articles.vue             # 文章列表
│   │   ├── ArticleDetail.vue        # 文章详情
│   │   ├── Works.vue                # 作品集
│   │   └── About.vue                # 关于
│   ├── App.vue / main.ts
│   └── style.css                    # 全局样式 + Tailwind 入口
├── database/                        # 后端相关（参考用）
│   ├── mayekun_blog.sql             # 数据库初始化脚本
│   └── deploy-guide.md              # 后端部署文档
├── .trae/documents/                 # 项目 PRD 与技术架构文档
│   ├── prd.md
│   └── tech-architecture.md
├── .env / .env.development / .env.production
├── index.html                       # HTML 模板（含 SEO meta）
├── tailwind.config.js / postcss.config.js
├── tsconfig.json
├── vite.config.ts                   # Vite 配置（含 /admin, /upload 代理）
└── package.json
```

## ⚙️ 环境配置

通过 `.env.*` 文件管理环境变量，**必须使用相对路径**，避免 CORS：

### `.env.development`（开发环境）
```ini
VITE_API_BASE_URL=/admin              # 通过 Vite proxy 转发
VITE_UPLOAD_URL=
VITE_PROXY_TARGET=http://api.mayekun.com
```

### `.env.production`（生产环境）
```ini
VITE_API_BASE_URL=/admin              # 走 Nginx 同域代理
VITE_UPLOAD_URL=
```

### Vite Proxy（`vite.config.ts`）
开发环境启动 `npm run dev` 时，Vite 会代理：
- `/admin/*` → `http://api.mayekun.com`（业务接口）
- `/upload/*` → `http://api.mayekun.com`（静态资源）

> ⚠️ **不要**直接写绝对地址（如 `http://api.mayekun.com`），会触发 CORS 跨域错误。

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务
npm run dev          # 默认 http://localhost:5173

# 3. 类型检查
npm run check

# 4. 生产构建
npm run build        # 输出到 dist/

# 5. 本地预览构建产物
npm run preview

# 6. 代码风格
npm run lint
npm run lint:fix
```

## 🗺 路由与页面

| 路径 | 名称 | 页面 | 说明 |
|------|------|------|------|
| `/` | home | `Home.vue` | 首页 |
| `/articles` | articles | `Articles.vue` | 文章列表（含热力图 + IP 卡片） |
| `/article/:id` | article-detail | `ArticleDetail.vue` | 文章详情（Markdown） |
| `/works` | works | `Works.vue` | 作品集（脑力点位图） |
| `/about` | about | `About.vue` | 关于我 |

路由守卫会自动设置 `document.title`。

## 📦 状态管理 (Pinia)

主仓库 `src/store/index.ts` 集中管理所有业务数据：

### State / Actions
- **文章**：`articles`、`articleCategories`、`heatMapData`、`fetchArticles()`、`fetchCategories()`、`fetchHeatMapData()`
- **作品**：`works`、`workCategories`、`filteredWorks`、`fetchWorks()`
- **个人信息**：`profile`、`fetchProfile()`
- **技能**：`skills`、`fetchSkills()`
- **成长时间轴**：`growthTimeline`、`fetchGrowthTimeline()`
- **热力图模式**：`heatmapMode`（`season` / `solar`）、`currentSeason`、`currentSolarTerm`
- **筛选状态**：`searchQuery`、`currentArticleCategory`、`currentWorkCategory`

### 关键常量
- `SOLAR_TERMS` —— 24 节气配置（含名称、月份、日期、主题色、物候描述）
- `HeatmapMode` / `SolarTermKey` —— 类型导出

## 🧩 核心组件

### 1. `ActivityHeatmap.vue`（文章活跃度热力图）
- 365 天网格热力图，按文章发布数量上色
- **双模式切换**：
  - **四季模式**（春/夏/秋/冬）：4 套独立配色
  - **节气模式**（24 节气）：每个节气独立颜色 + 物候描述
- 根据当前月份自动推断默认季节

### 2. `IPCard.vue` / `IPDetailCard.vue`（访客 IP 卡片）
- 位置：文章列表页右侧（与热力图并排）
- **`IPCard`**：使用 ippure.com 图片接口 `https://my.ippure.com/v1/card`
- **`IPDetailCard`**：通过 fetch `https://my.ippure.com/v1/info` 自定义渲染
  - ⚠️ 浏览器直接 fetch 会遇到 CORS，生产环境需通过后端代理

### 3. `WorkCard.vue` + `Works.vue`（作品脑力点位图）
- 左侧散布的**彩色点位**代表作品（按索引分配 18 色调色板）
- 不足 10 个作品时**用模拟点补足**（视觉上"待解锁"）
- 同分类点位用虚线连接，形成"脑力网络"
- 点击点位 → 右侧详情卡片显示封面、描述、标签、链接
- 顶部 **SVG 曲线成长时间轴**，含"成长轨迹 / 每一步都算数"端点文字

### 4. `AppFooter.vue`（底栏）
- 显示 QQ / 微信二维码（可切换）
- 工信部备案号（带 logo）
- **网站运行天数**（每分钟实时更新，跨午夜自动 +1）
- 版权信息 + ICP 备案

### 5. `ArticleDetail.vue`（文章详情）
- Markdown 渲染（markdown-it）+ 代码高亮（highlight.js）
- 右侧悬浮目录 (TOC) + 自动滚动阅读
- 悬浮音乐播放器

## 🔌 API 请求封装

所有请求统一通过 `src/api/request.ts`：

```ts
// 基础实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // /admin
  timeout: 15000
})

// 请求拦截器：附加 token
// 响应拦截器：统一错误处理、业务码校验
```

### 各模块 API
| 文件 | 说明 |
|------|------|
| `article.ts` | 文章分页查询、热力图、详情 |
| `category.ts` | 分类列表（type=1 文章 / 2 作品） |
| `work.ts` | 作品列表、详情 |
| `profile.ts` | 个人简介 |
| `skill.ts` | 技能图谱 |
| `growth.ts` | 成长时间轴 |

## 🎯 特色功能详解

### 二十四节气热力图
- 在 `store/index.ts` 中维护 `SOLAR_TERMS` 常量数组
- 每个节气有：名称、月份、日期、颜色、物候描述
- 切换到节气模式时，格子颜色随当前节气变化
- 显示当前节气的物候文案（如"东风解冻，蛰虫始振"）

### 脑力点位图
- **位置算法**：黄金角分布（`Math.PI * (3 - Math.sqrt(5))`），点位均匀散布在圆形区域
- **连线**：同分类点位之间画虚线，hover/active 时变实线
- **模拟点**：真实作品不足 10 个时用淡色"待解锁"占位（不可点击）
- **误触防护**：点位 button 尺寸固定为圆点大小（12px），标签用绝对定位避免扩大可点击区域

### 成长轨迹 SVG 曲线
- viewBox `0 0 1200 120`，沿水平方向 4 段贝塞尔曲线
- 渐变描边（蓝 → 紫 → 青），含模糊滤镜发光效果
- 端点文字"成长轨迹 / 每一步都算数"固定在画布左右两端

## 🚢 SEO 与部署

### SEO
- `index.html` 配置 og:image / og:title / og:description
- 建议 og:image 至少 200×200（实际使用 `my.jpg` 1200×630）
- 百度搜索资源平台验证站点可显示中文站名

### 部署架构
```
用户 → mayekun.com (Nginx)
            ├── 静态资源 → /usr/share/nginx/html
            ├── /admin/*  → proxy_pass http://api.mayekun.com
            └── /upload/* → proxy_pass http://api.mayekun.com
```

Nginx 关键配置（mayekun.com）：
```nginx
location /admin/ {
    proxy_pass http://api.mayekun.com;
    proxy_set_header Host api.mayekun.com;
    proxy_connect_timeout 60s;
    proxy_read_timeout 120s;
}

location /upload/ {
    proxy_pass http://api.mayekun.com;
}
```

Nginx 关键配置（api.mayekun.com）：
```nginx
location / {
    add_header 'Access-Control-Allow-Origin' '*' always;
    # ... 业务转发
}
```

### 部署流程
```bash
npm run build              # 生成 dist/
# 上传 dist 全部内容到 mayekun.com 服务器的 /usr/share/nginx/html/
# 确保 Nginx 配置正确
```

## 📐 开发约定

- **Vue 3 Composition API**：所有组件使用 `<script setup lang="ts">`
- **TypeScript 严格模式**：避免 `any`，所有数据结构在 `types/index.ts` 定义
- **CSS 变量主题**：通过 `var(--xxx)` 引用，支持暗色模式自动切换
- **路径别名**：`@/` → `src/`
- **样式作用域**：组件样式使用 `<style scoped>`
- **响应式单位**：rem / em / vw，固定值用 px

### 移动端断点
```css
@media (max-width: 1024px) { /* 平板 */ }
@media (max-width: 768px)  { /* 手机 */ }
@media (max-width: 480px)  { /* 小屏手机 */ }
```

## ⚠️ 待优化项 / Known Issues

- [ ] `IPDetailCard.vue` 因 ippure.com CORS 限制暂未启用（已用 `IPCard.vue` 图片版替代）
- [ ] 移动端脑力点位图点位标签已隐藏（`@media max-width: 768px`），但仍可点击
- [ ] 文章热力图 365 天格子在超窄屏（< 360px）下可能略拥挤
- [ ] `WorkCard.vue` 已被新脑力点位图替代但文件保留，可清理

## 📄 License

[MIT](./LICENSE) © 马业坤

---

🌟 如果觉得项目对你有帮助，欢迎 Star 一下！
