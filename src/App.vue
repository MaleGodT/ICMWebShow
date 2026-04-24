<template>
  <div class="app-container">
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="logo-icon"><Monitor /></el-icon>
          <h1>ICM 云量监测系统</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="header-menu"
        >
          <el-menu-item index="/">
            <el-icon><DataLine /></el-icon>
            <span>实时数据</span>
          </el-menu-item>
          <el-menu-item index="/history">
            <el-icon><Clock /></el-icon>
            <span>历史数据</span>
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: #fff;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;

    .logo-icon {
      font-size: 26px;
      color: #64b5f6;
    }

    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 1px;
      white-space: nowrap;
    }
  }

  .header-menu {
    background: transparent;
    border: none;
    --el-menu-bg-color: transparent;
    --el-menu-text-color: #c5cae9;
    --el-menu-active-color: #64b5f6;
    --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);

    .el-menu-item {
      font-size: 14px;
      height: 60px;
      line-height: 60px;
      border-bottom: none !important;
    }
  }
}

.app-main {
  flex: 1;
  background: #f0f2f5;
  padding: 16px;
  overflow-y: auto;
}
</style>
