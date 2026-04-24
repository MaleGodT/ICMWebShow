import dayjs from 'dayjs'

/**
 * 格式化时间
 * @param {string|Date} time
 * @param {string} fmt
 */
export function formatTime(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '--'
  return dayjs(time).format(fmt)
}

/**
 * 将后端相对路径拼接为可访问的图片 URL
 * 后端返回的路径已去除前两段目录，需拼上 baseURL
 */
export function resolveImageUrl(path) {
  if (!path) return ''
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // 拼接为 API 静态资源路径（根据实际部署调整）
  return `/api/DeviceData/image?path=${encodeURIComponent(path)}`
}

/**
 * 节流函数
 */
export function throttle(fn, delay = 1000) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}
