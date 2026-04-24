<template>
  <div class="history-page">
    <!-- 查询条件 -->
    <div class="card-panel query-bar">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="queryForm.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :shortcuts="shortcuts"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="queryForm.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :shortcuts="shortcuts"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 曲线图 -->
    <div class="card-panel chart-panel">
      <h3 class="section-title">云量趋势曲线</h3>
      <div ref="chartRef" class="chart-container"></div>
      <el-empty v-if="!loading && chartData.length === 0" description="暂无数据，请选择时间范围查询" />
    </div>

    <!-- 数据表格 -->
    <div class="card-panel table-panel">
      <h3 class="section-title">历史数据列表</h3>
      <el-table
        :data="pagedData"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
        max-height="400"
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column label="时间" min-width="180" align="center">
          <template #default="{ row }">
            {{ formatTime(row.time) }}
          </template>
        </el-table-column>
        <el-table-column label="红外云量" prop="irCover" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="coverTagType(row.irCover)" effect="light" size="small">
              {{ row.irCover ?? '--' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可见光云量" prop="visCover" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="coverTagType(row.visCover)" effect="light" size="small">
              {{ row.visCover ?? '--' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="chartData.length > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="chartData.length"
          layout="total, prev, pager, next, jumper"
          background
          small
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getResultDataTimes } from '../api/device'
import { formatTime } from '../utils'

// ============ 查询表单 ============
const queryForm = ref({
  startTime: dayjs().subtract(24, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
  endTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
})

const shortcuts = [
  { text: '最近 1 小时',  value: () => dayjs().subtract(1, 'hour').toDate() },
  { text: '最近 6 小时',  value: () => dayjs().subtract(6, 'hour').toDate() },
  { text: '最近 12 小时', value: () => dayjs().subtract(12, 'hour').toDate() },
  { text: '最近 24 小时', value: () => dayjs().subtract(24, 'hour').toDate() },
  { text: '最近 3 天',    value: () => dayjs().subtract(3, 'day').toDate() },
]

// ============ 数据 ============
const loading = ref(false)
const chartData = ref([])
const currentPage = ref(1)
const pageSize = 20

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return chartData.value.slice(start, start + pageSize)
})

function coverTagType(val) {
  if (val == null) return 'info'
  if (val < 0.3) return 'success'
  if (val < 0.7) return 'warning'
  return 'danger'
}

// ============ 图表 ============
const chartRef = ref(null)
let chartInstance = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  window.addEventListener('resize', handleResize)
}

function handleResize() {
  chartInstance?.resize()
}

function renderChart() {
  if (!chartInstance) return
  const data = chartData.value
  if (data.length === 0) {
    chartInstance.clear()
    return
  }

  const times = data.map(d => formatTime(d.time, 'MM-DD HH:mm'))
  const irData = data.map(d => d.irCover)
  const visData = data.map(d => d.visCover)

  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50,50,50,0.9)',
      borderColor: '#333',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter(params) {
        const time = params[0]?.axisValue || ''
        let html = `<div style="font-weight:600;margin-bottom:4px">${time}</div>`
        params.forEach(p => {
          const val = p.value != null ? p.value.toFixed(4) : '--'
          html += `<div style="display:flex;align-items:center;gap:6px">
            ${p.marker}<span>${p.seriesName}</span><b style="margin-left:auto">${val}</b>
          </div>`
        })
        return html
      }
    },
    legend: {
      data: ['红外云量', '可见光云量'],
      top: 8,
      textStyle: { fontSize: 13 }
    },
    grid: {
      left: 60, right: 30, top: 50, bottom: 60
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: {
        rotate: 30,
        fontSize: 11,
        color: '#666'
      },
      axisLine: { lineStyle: { color: '#ddd' } },
    },
    yAxis: {
      type: 'value',
      name: '云量',
      min: 0,
      max: 1,
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      axisLabel: { fontSize: 11, color: '#666' },
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100, height: 20, bottom: 8 }
    ],
    series: [
      {
        name: '红外云量',
        type: 'line',
        data: irData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2.5, color: '#ff9800' },
        itemStyle: { color: '#ff9800' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,152,0,0.25)' },
            { offset: 1, color: 'rgba(255,152,0,0.02)' },
          ])
        },
      },
      {
        name: '可见光云量',
        type: 'line',
        data: visData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2.5, color: '#2196f3' },
        itemStyle: { color: '#2196f3' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33,150,243,0.25)' },
            { offset: 1, color: 'rgba(33,150,243,0.02)' },
          ])
        },
      }
    ]
  }, true)
}

// ============ 查询逻辑 ============
async function handleQuery() {
  const { startTime, endTime } = queryForm.value
  if (!startTime || !endTime) {
    ElMessage.warning('请选择完整的时间范围')
    return
  }
  loading.value = true
  try {
    const data = await getResultDataTimes(startTime, endTime)
    chartData.value = Array.isArray(data) ? data : []
    currentPage.value = 1
    await nextTick()
    renderChart()
  } catch (e) {
    console.error('查询失败', e)
    ElMessage.error('查询历史数据失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryForm.value = {
    startTime: dayjs().subtract(24, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
    endTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
  }
  chartData.value = []
  currentPage.value = 1
  chartInstance?.clear()
}

// ============ 生命周期 ============
onMounted(() => {
  initChart()
  // 默认加载最近 24h 数据
  handleQuery()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style lang="scss" scoped>
.history-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.query-bar {
  .query-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
  }
}

.chart-panel {
  min-height: 380px;
}

.chart-container {
  width: 100%;
  height: 340px;
}

.table-panel {
  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }
}

@media (max-width: 768px) {
  .query-form {
    flex-direction: column;
    .el-form-item {
      margin-right: 0;
    }
  }
  .chart-container {
    height: 260px;
  }
}
</style>
