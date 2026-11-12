<template>
  <div class="about-page" :class="{ 'has-bg': hoveredSpot }">
    <!-- Dynamic Background -->
    <transition name="bg-fade">
      <div v-if="hoveredSpot" class="page-dynamic-bg" :key="hoveredSpot.name">
        <img :src="hoveredSpot.image" alt="" class="bg-img" />
        <div class="bg-overlay"></div>
        <div class="bg-info">
          <h3 class="bg-spot-name">{{ hoveredSpot.name }}</h3>
          <p class="bg-spot-desc">{{ hoveredSpot.desc }}</p>
        </div>
      </div>
    </transition>

    <div class="container page-content">
      <div class="about-grid">
        <!-- Sidebar -->
        <aside class="about-sidebar">
          <section class="profile-section">
            <div class="profile-card">
              <div class="profile-avatar-wrapper">
                <img :src="myAvatar" :alt="profile.name" class="profile-avatar" />
                <div class="avatar-glow"></div>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ profile.name }}</h2>
                <p class="profile-title">{{ profile.title }}</p>

                <div class="profile-meta">
                  <span class="profile-location">
                    <MapPin :size="15" />
                    {{ profile.location }}
                  </span>
                  <a :href="`mailto:${profile.email}`" class="profile-email">
                    <Mail :size="15" />
                    {{ profile.email }}
                  </a>
                </div>

                <div class="social-links">
                  <a v-if="profile.social.github" :href="profile.social.github" target="_blank" class="social-link" title="GitHub">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                  <a
                    :href="profile.social.xiaohongshu || 'https://www.xiaohongshu.com/'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-link"
                    title="小红书"
                    aria-label="小红书"
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                      <path d="M6.33984 14.4578C6.44609 14.2266 6.53516 14.0266 6.63047 13.8297C6.84922 13.425 7.04453 13.0094 7.21953 12.5828C7.32266 12.1828 7.71328 11.9391 8.10078 12.0328C8.65703 12.0719 9.21641 12.0422 9.79766 12.0422V4.79531C9.40703 4.79531 9.02109 4.78125 8.63828 4.79531C8.37109 4.80937 8.27734 4.72187 8.28516 4.43594C8.30391 3.75 8.28516 3.06094 8.28516 2.34375H13.7133V4.00781C13.7133 4.79063 13.7133 4.79063 12.9539 4.79063H12.1914V12.0359H13.8383C14.5023 12.0359 14.5023 12.0359 14.5023 12.7328V14.1938C14.5023 14.3953 14.4523 14.4984 14.2336 14.4984C11.657 14.4938 9.08047 14.4906 6.50391 14.4922C6.44766 14.4859 6.39297 14.4734 6.33984 14.4578Z"/>
                      <path d="M7.36523 9.20919C7.02617 9.90919 6.72773 10.5342 6.41523 11.1483C6.35898 11.2201 6.27617 11.2608 6.18711 11.2623C5.43242 11.2623 4.67305 11.292 3.92148 11.2358C3.16836 11.1795 2.8668 10.6951 3.1668 9.95607C3.50898 9.10294 3.91992 8.27794 4.30117 7.44201C4.32461 7.38888 4.34336 7.33576 4.38867 7.21857C4.08398 7.21857 3.8168 7.22638 3.54961 7.21857C3.33242 7.22169 3.11523 7.20138 2.90273 7.15919C2.49648 7.11076 2.2043 6.73107 2.25117 6.30919C2.26055 6.22013 2.28555 6.13419 2.32461 6.05294C2.78242 4.95451 3.29492 3.87794 3.78867 2.79669C3.94961 2.44201 4.11836 2.09201 4.29961 1.74669C4.34648 1.65763 4.4543 1.54357 4.53711 1.54044C5.24336 1.52326 5.95117 1.53107 6.72148 1.53107C6.6543 1.70294 6.6168 1.82013 6.56523 1.92951C6.13242 2.83419 5.69961 3.73732 5.26367 4.63888C5.17617 4.82169 5.06992 5.01232 5.39805 5.15138C5.48555 4.68107 5.83867 4.76701 6.14805 4.76701H7.93242C7.85742 4.94513 7.80898 5.06857 7.7543 5.18732C7.2043 6.33888 6.64336 7.48107 6.10117 8.63107C5.87773 9.09982 5.95273 9.21388 6.47148 9.21857C6.73867 9.21076 7.00898 9.20919 7.36523 9.20919ZM6.39492 12.0436C5.97617 12.8826 5.60273 13.6373 5.21992 14.3873C5.17461 14.4514 5.10273 14.492 5.02617 14.4967C3.99961 14.4842 2.97148 14.4654 1.9418 14.4389C1.80117 14.417 1.66367 14.3811 1.5293 14.3295L2.1043 13.167C2.2918 12.7826 2.47461 12.3998 2.67617 12.0342C2.73086 11.9451 2.82148 11.8858 2.92305 11.8717C3.86523 11.9186 4.80742 11.9842 5.75117 12.042C5.94023 12.0514 6.11992 12.0436 6.39492 12.0436Z"/>
                    </svg>
                  </a>
                  <a
                    :href="profile.social.douyin || 'https://www.douyin.com/'"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-link"
                    title="抖音"
                    aria-label="抖音"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                      <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48"/>
                    </svg>
                  </a>
                  <a v-if="profile.social.twitter" :href="profile.social.twitter" target="_blank" class="social-link" title="X">
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
                    </svg>
                  </a>
                  <a v-if="profile.social.linkedin" :href="profile.social.linkedin" target="_blank" class="social-link">
                    <Linkedin :size="18" />
                  </a>
                  <a v-if="profile.social.weibo" :href="profile.social.weibo" target="_blank" class="social-link">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M10.098 20c-4.612 0-8.59-2.507-8.59-5.5 0-1.56.932-3.36 2.53-5.076 2.133-2.267 4.618-3.293 5.548-2.293.425.45.507 1.19.243 2.13-.14.49.36.34.36.34 1.44-.51 2.75-.54 3.23.24.25.41.25.95-.02 1.55-.14.32.02.42.28.36.93-.19 1.65-.12 2.04.37.43.54.36 1.38-.17 2.38-.9 1.7-3.12 4.89-5.51 4.89zm-.17-10.19c-2.18.07-3.94 1.62-3.94 3.46 0 1.84 1.76 3.3 3.94 3.23 2.18-.07 3.94-1.62 3.94-3.46 0-1.84-1.76-3.3-3.94-3.23z"/>
                    </svg>
                  </a>
                  <a v-if="profile.social.gitee" :href="profile.social.gitee" target="_blank" class="social-link" title="Gitee">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                      <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z"/>
                    </svg>
                  </a>
                  <a v-if="profile.social.juejin" :href="profile.social.juejin" target="_blank" class="social-link" title="掘金">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 14.316l7.454-5.88-2.022-1.625L12 10.995l-5.432-4.184-2.022 1.625L12 14.316zm0-7.47l7.454-5.88-2.022-1.626L12 3.527l-5.432-4.187-2.022 1.626L12 6.846zm0 14.94l-7.454-5.88 2.022-1.626L12 19.995l5.432-4.215 2.022 1.626L12 21.856z"/>
                    </svg>
                  </a>
                  <a :href="`mailto:${profile.email}`" class="social-link">
                    <Mail :size="18" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- 广西风光（侧边栏）：从头像卡片掉落，展示后被吸进推荐按钮 -->
          <section class="travel-section">
            <div
              class="travel-machine"
              @mouseenter="onTravelEnter"
              @mouseleave="onTravelLeave"
            >
              <div class="travel-stage">
                <Transition name="travel-card">
                  <div :key="activeTravelSpot.name" class="machine-card" @click="advanceTravel">
                    <img :src="activeTravelSpot.image" :alt="activeTravelSpot.name" class="machine-img" />
                    <div class="machine-overlay">
                      <h4 class="machine-name">{{ activeTravelSpot.name }}</h4>
                      <p class="machine-desc">{{ activeTravelSpot.desc }}</p>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <div class="travel-header" :class="{ sucking: isSucking }">
              <span class="inhale-ring" aria-hidden="true"></span>
              <button class="recommend-btn" type="button" @click="showRecommendModal = true">
                <Plus :size="14" />
                推荐景点
              </button>
            </div>
          </section>
        </aside>

        <!-- Main content -->
        <div class="about-main">
          <section class="bio-section">
            <p class="about-bio">{{ profile.bio }}</p>
          </section>

          <section class="timeline-section" v-if="growthTimeline.length > 0">
            <h2 class="section-title">成长经历</h2>
            <div class="growth-axis">
              <button
                v-for="(item, index) in growthTimeline"
                :key="`${item.year}-${index}`"
                type="button"
                class="growth-node"
                :class="{
                  active: activeGrowthIndex === index,
                  current: item.isCurrent,
                  'edge-start': index === 0,
                  'edge-end': index === growthTimeline.length - 1
                }"
                :style="{ '--dot-color': item.color }"
                @mouseenter="setActiveGrowth(index)"
                @mouseleave="clearActiveGrowth"
                @focus="setActiveGrowth(index)"
                @blur="clearActiveGrowth"
                @click="setActiveGrowth(index)"
              >
                <span class="node-dot"></span>
                <span class="node-year">{{ item.year }}</span>
                <span class="node-label">{{ item.label }}</span>

                <span class="node-bubble" role="tooltip">
                  <span class="bubble-head">
                    <span class="bubble-year">{{ item.year }}</span>
                    <span class="bubble-label">{{ item.label }}</span>
                  </span>
                  <span class="bubble-desc">{{ item.desc }}</span>
                  <span v-if="item.achievements.length" class="bubble-tags">
                    <span v-for="a in item.achievements" :key="a" class="bubble-tag">{{ a }}</span>
                  </span>
                </span>
              </button>
            </div>
          </section>

          <section class="skills-section">
            <h2 class="section-title">技能专长</h2>
            <div class="skills-card">
              <div class="skill-items">
                <a
                  v-for="item in profile.skills"
                  :key="item.name"
                  :href="item.url || '#'"
                  :target="item.url ? '_blank' : undefined"
                  class="skill-tag"
                  :title="item.name"
                >
                  <img
                    :src="`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${item.icon}/${item.icon}-original.svg`"
                    :alt="item.name"
                    class="skill-icon"
                    @error="onIconError"
                  />
                  <span class="skill-tag-name">{{ item.name }}</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Recommend Modal -->
    <a-modal
      v-model:open="showRecommendModal"
      title="推荐广西景点"
      :okText="'提交审核'"
      :cancelText="'取消'"
      @ok="submitRecommend"
      :okButtonProps="{ disabled: !recommendForm.name || !recommendForm.desc }"
    >
      <div class="recommend-form">
        <div class="form-item">
          <label>景点名称 <span class="required">*</span></label>
          <a-input v-model:value="recommendForm.name" placeholder="如：桂林山水" />
        </div>
        <div class="form-item">
          <label>景点描述 <span class="required">*</span></label>
          <a-textarea v-model:value="recommendForm.desc" placeholder="简短描述该景点的特色" :rows="3" />
        </div>
        <div class="form-item">
          <label>景点图片</label>
          <a-input v-model:value="recommendForm.image" placeholder="图片URL（可选）" />
        </div>
        <div class="form-item">
          <label>推荐人</label>
          <a-input v-model:value="recommendForm.author" placeholder="您的昵称（可选）" />
        </div>
        <div class="form-tip">
          <Info :size="14" />
          提交后将由站主审核后展示
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { MapPin, Linkedin, Mail, Plus, Info } from 'lucide-vue-next'
import { useBlogStore } from '@/store'
import myAvatar from '@/assets/my.jpg'

const blogStore = useBlogStore()
const profile = computed(() => blogStore.profileData)

// 成长轨迹：与作品页共用后端数据
const growthTimeline = computed(() => {
  const data = blogStore.growthTimelineData
  if (!data || data.length === 0) return []
  return [...data]
    .sort((a, b) => a.year - b.year)
    .map((vo) => ({
      year: vo.year,
      label: vo.label || '',
      desc: vo.description || '',
      achievements: vo.achievement ? vo.achievement.split(/[,，、]/).filter(Boolean) : [],
      color: vo.color || '#06b6d4',
      isCurrent: vo.isCurrent === 1,
    }))
})

onMounted(() => {
  blogStore.fetchProfile()
  blogStore.fetchSkills()
  blogStore.fetchGrowthTimeline()
})
const hoveredSpot = ref<{ name: string; desc: string; image: string } | null>(null)
const showRecommendModal = ref(false)
const recommendForm = ref({
  name: '',
  desc: '',
  image: '',
  author: ''
})

let hoverTimer: ReturnType<typeof setTimeout> | null = null

const onCardHover = (spot: { name: string; desc: string; image: string }) => {
  hoverTimer = setTimeout(() => {
    hoveredSpot.value = spot
  }, 300)
}

const onCardLeave = () => {
  hoveredSpot.value = null
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
}

// 景点：每 7 秒从头像卡片掉落一张，展示后被缓慢吸进「推荐景点」按钮
const travelSpots = computed(() => guangxiSpots.slice(0, 6))
const activeTravelIndex = ref(0)
const activeTravelSpot = computed(() => travelSpots.value[activeTravelIndex.value])
const isSucking = ref(false)
let travelTimer: ReturnType<typeof setInterval> | null = null
let suckTimer: ReturnType<typeof setTimeout> | null = null

const triggerSuck = () => {
  if (suckTimer) clearTimeout(suckTimer)
  isSucking.value = false
  requestAnimationFrame(() => {
    isSucking.value = true
  })
  suckTimer = setTimeout(() => {
    isSucking.value = false
  }, 2200)
}

const advanceTravel = () => {
  triggerSuck()
  activeTravelIndex.value = (activeTravelIndex.value + 1) % travelSpots.value.length
}

const stopTravelRotation = () => {
  if (travelTimer) {
    clearInterval(travelTimer)
    travelTimer = null
  }
}

const startTravelRotation = () => {
  stopTravelRotation()
  travelTimer = setInterval(advanceTravel, 7000)
}

const onTravelEnter = () => {
  stopTravelRotation()
  onCardHover(activeTravelSpot.value)
}

const onTravelLeave = () => {
  startTravelRotation()
  onCardLeave()
}

onMounted(() => {
  startTravelRotation()
})

onUnmounted(() => {
  stopTravelRotation()
  if (suckTimer) clearTimeout(suckTimer)
  if (hoverTimer) clearTimeout(hoverTimer)
})

// 横向时间线：鼠标悬停/点击的节点，气泡显示在节点上方
const activeGrowthIndex = ref(-1)
const setActiveGrowth = (index: number) => {
  activeGrowthIndex.value = index
}
const clearActiveGrowth = () => {
  activeGrowthIndex.value = -1
}

const submitRecommend = () => {
  // 前端模拟提交，实际项目中应调用后端API
  const pending = JSON.parse(localStorage.getItem('guangxi_pending') || '[]')
  pending.push({
    ...recommendForm.value,
    status: 'pending',
    createdAt: new Date().toISOString()
  })
  localStorage.setItem('guangxi_pending', JSON.stringify(pending))
  recommendForm.value = { name: '', desc: '', image: '', author: '' }
  showRecommendModal.value = false
}

const onIconError = (e: Event) => {
  const img = e.target as HTMLImageElement
  const src = img.src.replace('-original.svg', '-plain.svg')
  if (img.src !== src) {
    img.src = src
  } else {
    img.style.display = 'none'
  }
}

const guangxiSpots = [
  { name: '桂林山水', desc: '山水甲天下', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guilin%20karst%20mountains%20Li%20River%20misty%20landscape%20China%20photography&image_size=landscape_16_9' },
  { name: '阳朔西街', desc: '千年古街风情', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangshuo%20West%20Street%20night%20lanterns%20ancient%20town%20Guangxi%20China&image_size=landscape_16_9' },
  { name: '龙脊梯田', desc: '大地艺术奇观', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Longji%20rice%20terraces%20golden%20layers%20mountains%20Guangxi%20China%20aerial%20view&image_size=landscape_16_9' },
  { name: '德天瀑布', desc: '亚洲第一跨国瀑布', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Detian%20waterfall%20cascading%20water%20lush%20green%20Guangxi%20border%20China&image_size=landscape_16_9' },
  { name: '北海银滩', desc: '天下第一滩', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beihai%20Silver%20Beach%20white%20sand%20blue%20sea%20tropical%20Guangxi%20China&image_size=landscape_16_9' },
  { name: '黄姚古镇', desc: '千年古镇梦境', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangyao%20ancient%20town%20stone%20bridge%20river%20traditional%20buildings%20Guangxi&image_size=landscape_16_9' },
  { name: '漓江风光', desc: '百里画廊', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Li%20River%20bamboo%20raft%20karst%20peaks%20reflection%20water%20Guilin%20China&image_size=landscape_16_9' },
  { name: '涠洲岛', desc: '中国最年轻火山岛', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Weizhou%20Island%20volcanic%20rock%20cliff%20ocean%20tropical%20Beihai%20Guangxi&image_size=landscape_16_9' },
  { name: '象鼻山', desc: '桂林城徽标志', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elephant%20Trunk%20Hill%20Xiangbishan%20Guilin%20river%20reflection%20sunset%20China&image_size=landscape_16_9' },
  { name: '遇龙河', desc: '小家碧玉般清幽', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yulong%20River%20bamboo%20rafting%20peaceful%20countryside%20karst%20Yangshuo%20Guangxi&image_size=landscape_16_9' },
]
</script>

<style scoped>
.about-page {
  position: relative;
  padding: 40px 0 80px;
  min-height: calc(100vh - 64px);
}

/* Dynamic Background */
.page-dynamic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(8px) brightness(0.4);
  transform: scale(1.05);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.bg-info {
  position: absolute;
  bottom: 80px;
  left: 80px;
  color: white;
  z-index: 1;
}

.bg-spot-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.bg-spot-desc {
  font-size: 1.125rem;
  opacity: 0.9;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 0.6s ease;
}

.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

/* Page content layer */
.page-content {
  position: relative;
  z-index: 1;
}

/* Two-column layout */
.about-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 48px;
  align-items: start;
}

.about-sidebar {
  align-self: start;
}

.about-main {
  min-width: 0;
}

.bio-section {
  margin-bottom: 36px;
}

.about-bio {
  position: relative;
  display: inline-block;
  margin: 0;
  padding-bottom: 8px;
  font-family: 'STXingkai', '华文行楷', 'STKaiti', 'KaiTi', '楷体', serif;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  transition: color 0.4s ease;
}

.about-bio::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 2px;
  left: 0;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--primary-color);
  opacity: 0.2;
  transform: rotate(-1deg);
}

/* When background is active, make cards more opaque */
.about-page.has-bg .profile-card,
.about-page.has-bg .skills-card {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
}

.about-page.has-bg .section-title,
.about-page.has-bg .about-bio {
  color: white;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.about-page.has-bg .skill-tag {
  background: rgba(255, 255, 255, 0.85);
}

/* Profile sidebar card */
.profile-section {
  margin: 0;
}

.profile-card {
  position: relative;
  z-index: 2;
  padding: 28px 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  text-align: center;
  transition: background 0.4s ease, backdrop-filter 0.4s ease;
}

.profile-avatar-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 16px;
}

.profile-avatar {
  position: relative;
  z-index: 1;
  display: block;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: var(--primary-gradient);
  opacity: 0.2;
  filter: blur(18px);
}

.profile-name {
  margin-bottom: 4px;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

.profile-title {
  margin-bottom: 16px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.profile-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.profile-location,
.profile-email {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.profile-email {
  transition: color var(--transition-fast);
}

.profile-email:hover {
  color: var(--primary-color);
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-secondary);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.social-link:hover {
  background: var(--primary-color);
  color: #fff;
  transform: translateY(-2px);
}

/* Skills Section */
.skills-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.0625rem;
  font-weight: 600;
  margin-bottom: 14px;
  transition: color 0.4s ease;
}

.skills-card {
  padding: 28px;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  transition: background 0.4s ease, backdrop-filter 0.4s ease;
}

.skill-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.skill-tag:hover {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.06);
  transform: translateY(-1px);
  color: var(--primary-color);
}

.skill-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.skill-tag-name {
  white-space: nowrap;
}

/* Growth timeline (horizontal) */
.timeline-section {
  margin-bottom: 40px;
}

.growth-axis {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.growth-axis::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 6%;
  right: 6%;
  height: 2px;
  background: var(--border-color);
}

.growth-node {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.growth-node.active {
  z-index: 40;
}

.node-dot {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  border: 2px solid var(--dot-color, var(--primary-color));
  border-radius: 50%;
  background: var(--bg-primary);
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.growth-node.active .node-dot {
  background: var(--dot-color, var(--primary-color));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--dot-color, var(--primary-color)) 18%, transparent);
  transform: scale(1.1);
}

.node-year {
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
}

.node-label {
  margin-top: 2px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.growth-node.active .node-label {
  color: var(--text-primary);
  font-weight: 600;
}

/* 悬停气泡：显示在节点上方 */
.node-bubble {
  position: absolute;
  bottom: calc(100% + 16px);
  left: 50%;
  z-index: 30;
  width: 240px;
  padding: 12px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  text-align: left;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, 6px);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
}

.growth-node.active .node-bubble {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, 0);
}

.node-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  width: 10px;
  height: 10px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  transform: translateX(-50%) rotate(45deg);
}

/* 首尾节点靠边对齐，防止气泡溢出 */
.growth-node.edge-start .node-bubble {
  left: 0;
  transform: translateY(6px);
}

.growth-node.edge-start.active .node-bubble {
  transform: translateY(0);
}

.growth-node.edge-start .node-bubble::after {
  left: 26px;
  transform: rotate(45deg);
}

.growth-node.edge-end .node-bubble {
  right: 0;
  left: auto;
  transform: translateY(6px);
}

.growth-node.edge-end.active .node-bubble {
  transform: translateY(0);
}

.growth-node.edge-end .node-bubble::after {
  right: 26px;
  left: auto;
  transform: rotate(45deg);
}

.bubble-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.bubble-year {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.bubble-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.bubble-desc {
  display: block;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.bubble-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.bubble-tag {
  padding: 1px 6px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  font-size: 0.625rem;
  color: var(--text-tertiary);
}

.about-page.has-bg .node-year,
.about-page.has-bg .node-label {
  color: rgba(255, 255, 255, 0.75);
}

.about-page.has-bg .growth-node.active .node-label {
  color: #fff;
}

/* Guangxi Travel Section (sidebar) */
.travel-section {
  position: relative;
  z-index: 1;
  margin-top: 20px;
}

.travel-header {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
}

.recommend-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s ease, color 0.2s ease;
}

@media (hover: hover) and (pointer: fine) {
  .recommend-btn:hover {
    background: var(--primary-color);
    color: #fff;
  }
}

/* 景点：从头像卡片掉落 -> 展示 -> 被吸进推荐按钮 */
.travel-machine {
  position: relative;
  z-index: 0;
}

.travel-stage {
  position: relative;
  height: 150px;
}

.machine-card {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  /* 缩放时朝下方按钮的位置收缩 */
  transform-origin: 50% 122%;
}

.machine-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.machine-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 26px 10px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
}

.machine-name {
  margin: 0 0 1px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.machine-desc {
  margin: 0;
  font-size: 0.6875rem;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 新卡片从上方的卡片后面缓慢掉落，旧卡片被吸向按钮 */
.travel-card-enter-active {
  z-index: 4;
  transition: transform 1.4s cubic-bezier(0.4, 0.05, 0.6, 0.95), opacity 0.7s ease;
}

.travel-card-leave-active {
  z-index: 2;
  transition: transform 2s cubic-bezier(0.5, 0.05, 0.3, 1), opacity 1.6s ease-in;
}

.travel-card-enter-from {
  transform: translateY(-115%);
  opacity: 0.5;
}

.travel-card-leave-to {
  transform: translateY(10px) scale(0.04) rotate(5deg);
  opacity: 0;
}

/* 吸入按钮：旋风圈 + 按钮脉冲 */
.inhale-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 26px;
  height: 26px;
  margin: -13px 0 0 -13px;
  border: 1.5px dashed var(--primary-color);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}

.travel-header.sucking .inhale-ring {
  animation: inhale-ring 1.8s ease-in forwards;
}

@keyframes inhale-ring {
  0% {
    opacity: 0;
    transform: scale(2.6) rotate(0deg);
  }
  30% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
    transform: scale(0.15) rotate(320deg);
  }
}

.travel-header.sucking .recommend-btn {
  animation: btn-inhale 1.8s ease-in-out;
}

@keyframes btn-inhale {
  0%,
  65% {
    transform: scale(1);
  }
  80% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

/* Recommend Modal */
.recommend-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.required {
  color: #f56c6c;
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.06);
  border-radius: var(--radius-lg);
}

@media (max-width: 1024px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .profile-card {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;
    text-align: left;
  }

  .travel-machine {
    max-width: 400px;
  }

  .profile-avatar-wrapper {
    width: 120px;
    height: 120px;
    margin: 0;
    flex-shrink: 0;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
  }

  .profile-meta {
    align-items: flex-start;
  }

  .social-links {
    justify-content: flex-start;
  }

  .bg-info {
    left: 24px;
    bottom: 40px;
  }

  .bg-spot-name {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .about-page {
    padding: 32px 0 64px;
  }

  .profile-card {
    flex-direction: column;
    gap: 0;
    text-align: center;
    padding: 24px 18px;
  }

  .profile-avatar-wrapper {
    margin: 0 auto 12px;
  }

  .profile-meta {
    align-items: center;
  }

  .social-links {
    justify-content: center;
  }

  .profile-name {
    font-size: 1.375rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .about-bio {
    font-size: 1.25rem;
  }

  /* 移动端气泡统一显示在时间线上方，避免超出屏幕 */
  .growth-node {
    position: static;
  }

  .node-bubble,
  .growth-node.edge-start .node-bubble,
  .growth-node.edge-end .node-bubble {
    left: 0;
    right: 0;
    width: auto;
    transform: translateY(6px);
  }

  .growth-node.active .node-bubble,
  .growth-node.edge-start.active .node-bubble,
  .growth-node.edge-end.active .node-bubble {
    transform: translateY(0);
  }

  .node-bubble::after {
    display: none;
  }

  .bg-spot-name {
    font-size: 1.5rem;
  }

  .bg-info {
    left: 16px;
    bottom: 24px;
  }
}
</style>
