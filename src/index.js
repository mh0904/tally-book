// src/index.js
import React from 'react'
import './index.less'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 配置dayjs使用中文本地化
dayjs.locale('zh-cn')
// 导入页面组件
import Home from './pages/home'
import Transactions from './pages/transactions/index.jsx'
import Chart from './pages/chart/index.jsx'
import DailyBills from './pages/dailyBills/index.jsx'

// 导入导航栏
import Navbar from './components/navBar/index.jsx'

const pageMeta = {
  '/': {
    title: '首页',
    description: '账本总览',
  },
  '/transactions': {
    title: '流水管理',
    description: '交易记录',
  },
  '/chart': {
    title: '图表分析',
    description: '支出统计',
  },
  '/daily-bills': {
    title: '每日账单',
    description: '日账明细',
  },
}

// 根组件（包含导航栏和路由出口）
const App = () => {
  const location = useLocation()
  const currentPage = pageMeta[location.pathname] || pageMeta['/']
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="admin-shell">
      <Navbar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{currentPage.title}</h1>
            <span>{currentPage.description}</span>
          </div>
          <div className="admin-date">{dayjs().format('YYYY年MM月DD日')}</div>
        </header>
        <section className="admin-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/daily-bills" element={<DailyBills />} />
          </Routes>
        </section>
      </main>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
// 用 BrowserRouter 包裹整个应用
root.render(
  <BrowserRouter>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </BrowserRouter>
)
