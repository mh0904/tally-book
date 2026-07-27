// src/pages/Home.js
import { Link } from 'react-router-dom'
import {
  CalendarOutlined,
  PieChartOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import './index.less'

const quickLinks = [
  {
    title: '流水管理',
    desc: '录入、编辑、筛选账单',
    link: '/transactions',
    icon: <UnorderedListOutlined />,
  },
  {
    title: '图表分析',
    desc: '查看分类和日支出趋势',
    link: '/chart',
    icon: <PieChartOutlined />,
  },
  {
    title: '每日账单',
    desc: '按日期展开月度明细',
    link: '/daily-bills',
    icon: <CalendarOutlined />,
  },
]

const Home = () => {
  return (
    <div className="home-dashboard">
      <section className="home-summary page-panel">
        <div>
          <h2>记账本后台</h2>
          <p>管理本地账单数据、查看支出统计、整理每日明细。</p>
        </div>
        <Link className="home-primary-action" to="/transactions">
          <UnorderedListOutlined />
          进入流水管理
        </Link>
      </section>

      <section className="home-quick-grid">
        {quickLinks.map((item) => (
          <Link
            className="home-quick-item page-panel"
            key={item.link}
            to={item.link}
          >
            <span className="home-quick-icon">{item.icon}</span>
            <strong>{item.title}</strong>
            <em>{item.desc}</em>
          </Link>
        ))}
      </section>
    </div>
  )
}

export default Home
