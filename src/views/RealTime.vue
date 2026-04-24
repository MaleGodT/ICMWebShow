<template>
  <div class="realtime-page">
    <!-- 顶部状态栏 -->
    <div class="status-bar card-panel">
      <div class="status-item">
        <el-icon><Timer /></el-icon>
        <span>数据时间：{{ formatTime(resultData?.dateTime) }}</span>
      </div>
      <div class="status-item">
        <el-icon><Clock /></el-icon>
        <span>RTC 时间：{{ formatTime(resultData?.rtcTime) }}</span>
      </div>
      <div class="status-item" :class="loading ? 'syncing' : 'synced'">
        <el-icon><Refresh /></el-icon>
        <span>{{ loading ? '刷新中...' : '已同步' }}</span>
      </div>
      <div class="status-actions">
        <el-button size="small" @click="toggleAutoRefresh">
          <el-icon><VideoPause v-if="autoRefresh" /><VideoPlay v-else /></el-icon>
          {{ autoRefresh ? '暂停刷新' : '自动刷新' }}
        </el-button>
        <el-tag :type="autoRefresh ? 'success' : 'info'" size="small" effect="plain">
          {{ refreshInterval }}s 间隔
        </el-tag>
      </div>
    </div>

    <!-- 图像展示区 -->
    <div class="image-section">
      <h3 class="section-title">图像监测</h3>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6" v-for="img in imageList" :key="img.key">
          <div class="card-panel image-card">
            <div class="image-label">{{ img.label }}</div>
            <div class="image-wrapper">
              <el-image
                :src="img.src"
                fit="contain"
                :preview-src-list="img.src ? [img.src] : []"
                preview-teleported
                loading="lazy"
              >
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon :size="32"><Picture /></el-icon>
                    <span>加载中...</span>
                  </div>
                </template>
                <template #error>
                  <div class="image-placeholder error">
                    <el-icon :size="32"><PictureFilled /></el-icon>
                    <span>暂无图像</span>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 云量数据 -->
    <div class="data-section">
      <h3 class="section-title">云量数据</h3>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="8" :md="4" v-for="item in cloudData" :key="item.label">
          <div class="card-panel data-card">
            <div class="data-icon" :style="{ background: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-value">{{ item.value ?? '--' }}</div>
              <div class="data-label">{{ item.label }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 设备状态 -->
    <div class="data-section">
      <h3 class="section-title">设备状态</h3>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="8" :md="4" v-for="item in deviceStatus" :key="item.label">
          <div class="card-panel data-card">
            <div class="data-icon" :style="{ background: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="data-info">
              <div class="data-value">{{ item.value ?? '--' }}</div>
              <div class="data-label">{{ item.label }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 环境 & 电气数据 -->
    <div class="data-section">
      <h3 class="section-title">环境及电气数据</h3>
      <el-row :gutter="12">
        <el-col :xs="12" :sm="8" :md="4" v-for="item in envData" :key="item.label">
          <div class="card-panel data-card-sm">
            <div class="data-label">{{ item.label }}</div>
            <div class="data-value-sm">{{ item.value ?? '--' }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getRealData } from '../api/device'
import { formatTime } from '../utils'

// ============ 状态 ============
const resultData = ref(null)
const deviceState = ref(null)
const loading = ref(false)
const autoRefresh = ref(true)
const refreshInterval = ref(10)
let timer = null

// ============ 图像列表 ============
const imageList = computed(() => {
  const d = resultData.value || {}
  return [
    { key: 'visRaw',    label: '可见光原始图像',  src: d.visRawJpgPath },
    { key: 'visSharp',  label: '可见光处理图像',  src: d.visSharpJpgPath },
    { key: 'irGray',    label: '红外灰度图像',    src: d.irGrayJpgPath },
    { key: 'irTem',     label: '红外温度图像',    src: d.irTemJpgPath },
  ]
})

// ============ 云量数据 ============
const cloudData = computed(() => {
  const r = resultData.value || {}
  const s = deviceState.value || {}
  return [
    { label: '可见光云量', value: r.visCloudCover,        icon: 'Sunny',           color: '#4caf50' },
    { label: '红外云量',   value: r.irCloudCoverRatio,    icon: 'Cloudy',          color: '#ff9800' },
    { label: '红外中心云高', value: r.irCloudHeight,      icon: 'Top',             color: '#2196f3' },
    { label: '云状',       value: r.cloudShape,           icon: 'CloudyAndSunny',  color: '#9c27b0' },
    { label: '设备状态',   value: s.deviceStatus,         icon: 'Monitor',         color: '#607d8b' },
    { label: '红外状态',   value: s.irStatus,             icon: 'View',            color: '#795548' },
  ]
})

// ============ 设备状态 ============
const deviceStatus = computed(() => {
  const s = deviceState.value || {}
  return [
    { label: '气压',     value: s.pressure,        icon: 'Odometer',    color: '#3f51b5' },
    { label: '海拔',     value: s.altitude,         icon: 'Position',    color: '#009688' },
    { label: '黑体温度', value: s.blackBodyTemp,    icon: 'Sunny',       color: '#f44336' },
    { label: '湿度',     value: s.humidity,         icon: 'Drizzling',   color: '#00bcd4' },
    { label: '内部温度', value: s.innerTemp,        icon: 'Thermometer', color: '#e91e63' },
    { label: '温度',     value: s.temperature,      icon: 'Thermometer', color: '#ff5722' },
  ]
})

// ============ 环境 & 电气数据 ============
const envData = computed(() => {
  const s = deviceState.value || {}
  return [
    { label: '加热电流',   value: s.heatingCurrent },
    { label: '加热电压',   value: s.heatingVoltage },
    { label: '红外电流',   value: s.irCurrent },
    { label: '红外温度',   value: s.irTemp },
    { label: '红外电压',   value: s.irVoltage },
    { label: '纬度',       value: s.latitude },
    { label: '经度',       value: s.longitude },
    { label: '磁偏角',     value: s.magneticDeclination },
    { label: '电机电流',   value: s.motorCurrent },
    { label: '电机电压',   value: s.motorVoltage },
    { label: '电机温度',   value: s.motorTemp },
    { label: '系统电流',   value: s.systemCurrent },
    { label: '系统电压',   value: s.systemVoltage },
    { label: '可见光电压', value: s.visVoltage },
    { label: '可见光电流', value: s.visCurrent },
    { label: '可见光温度', value: s.visTemp },
  ]
})

// ============ 数据获取 ============
async function fetchData() {
  loading.value = true
  try {
    const data = await getRealData()
    resultData.value = data?.resultData || null
    deviceState.value = data?.deviceState || null
  } catch (e) {
    console.error('获取实时数据失败', e)
  } finally {
    loading.value = false
  }
}

function startTimer() {
  stopTimer()
  if (autoRefresh.value) {
    timer = setInterval(fetchData, refreshInterval.value * 1000)
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value
  if (autoRefresh.value) {
    startTimer()
  } else {
    stopTimer()
  }
}

onMounted(() => {
  fetchData()
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>
.realtime-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 顶部状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding: 12px 20px;

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #606266;

    .el-icon { font-size: 16px; }
  }

  .syncing { color: #e6a23c; }
  .synced  { color: #67c23a; }

  .status-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

/* 图像卡片 */
.image-section {
  .el-row {
    row-gap: 16px;
  }
}

.image-card {
  padding: 12px;
  text-align: center;

  .image-label {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .image-wrapper {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 6px;
    overflow: hidden;
    background: #f5f7fa;

    .el-image {
      width: 100%;
      height: 100%;
    }
  }
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  gap: 8px;

  &.error { color: #f56c6c; }
}

/* 数据卡片 */
.data-section {
  .el-row {
    row-gap: 12px;
  }
}

.data-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;

  .data-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    flex-shrink: 0;
  }

  .data-info {
    .data-value {
      font-size: 18px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }
    .data-label {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
}

.data-card-sm {
  padding: 10px 14px;
  text-align: center;

  .data-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }
  .data-value-sm {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .status-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    .status-actions { margin-left: 0; }
  }
}
</style>
