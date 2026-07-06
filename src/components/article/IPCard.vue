<template>
  <a
    href="https://ippure.com"
    target="_blank"
    rel="noopener noreferrer"
    class="ip-card"
  >
    <img
      src="https://my.ippure.com/v1/card"
      alt="访客IP信息卡片"
      title="点击查看IP信息"
      loading="lazy"
    />
  </a>
</template>

<script setup lang="ts">
</script>

<style scoped>
.ip-card {
  display: flex;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: transform var(--transition-fast);
}

.ip-card:hover {
  transform: scale(1.01);
}

.ip-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
</style>
