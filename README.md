# ICM 云量监测系统 - 前端

基于 Vue 3 + Element Plus + ECharts 的云量监测前端工程。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue 3 | 3.4+ | 前端框架 (Composition API) |
| Vue Router 4 | 4.3+ | 路由管理 |
| Element Plus | 2.6+ | UI 组件库 |
| ECharts | 5.5+ | 图表可视化 |
| Axios | 1.6+ | HTTP 请求 |
| Vite | 5.2+ | 构建工具 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 生产构建
npm run build
```

## 后端接口配置

开发模式下，Vite 会将 `/api` 请求代理到 `http://localhost:5000`。
如需修改后端地址，编辑 `vite.config.js` 中的 `proxy.target`。

## 页面功能

### 实时数据页 (`/`)
- 4 张图像实时展示（可见光×2 + 红外×2），支持大图预览
- 云量数据、设备状态、环境电气数据卡片展示
- 可配置自动刷新间隔（默认 10 秒）

### 历史数据页 (`/history`)
- 时间范围查询（快捷选项：1h / 6h / 12h / 24h / 3d）
- 红外云量 & 可见光云量趋势曲线（ECharts）
- 支持鼠标悬浮查看详情、时间轴缩放
- 数据表格 + 分页浏览

## 项目结构

```
src/
├── api/          # 接口请求层
│   └── device.js
├── assets/       # 全局样式
│   └── global.scss
├── router/       # 路由配置
│   └── index.js
├── utils/        # 工具函数
│   └── index.js
├── views/        # 页面组件
│   ├── RealTime.vue
│   └── History.vue
├── App.vue       # 根组件
└── main.js       # 入口文件
```
