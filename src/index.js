// src/index.js
import React from 'react'
import './index.less'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 配置dayjs使用中文本地化
dayjs.locale('zh-cn')
// 导入页面组件
import Home from './pages/home'
import Transactions from './pages/transactions/index.jsx'
import AddTransaction from './pages/addTransaction/index.jsx'
// 导入导航栏
import Navbar from './components/navBar'

// 根组件（包含导航栏和路由出口）
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/add" element={<AddTransaction />} />
      </Routes>
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
