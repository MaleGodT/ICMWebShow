import axios from 'axios'

const http = axios.create({
  baseURL: '/api/DeviceData',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 响应拦截：统一错误处理
http.interceptors.response.use(
  res => res.data,
  err => {
    console.error('[API Error]', err.message)
    return Promise.reject(err)
  }
)

/**
 * 获取实时数据
 * @returns {Promise<{ResultData: object, DeviceState: object}>}
 */
export function getRealData() {
  return http.get('/GetRealData')
}

/**
 * 获取历史数据（时间范围）
 * @param {string} startTime - ISO 格式时间
 * @param {string} endTime   - ISO 格式时间
 * @returns {Promise<Array<{Time, IrCover, VisCover}>>}
 */
export function getResultDataTimes(startTime, endTime) {
  return http.get('/GetResultDataTimes', {
    params: { startTime, endTime }
  })
}

/**
 * 获取指定时间点数据
 * @param {string} time - ISO 格式时间
 * @returns {Promise<{ResultData: object, DeviceState: object}>}
 */
export function getResultDataByTime(time) {
  return http.get('/GetResultDataByTime', {
    params: { time }
  })
}
