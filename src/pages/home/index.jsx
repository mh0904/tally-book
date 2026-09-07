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
    title: '账单日历',
    desc: '在日历中查看每天账单总额和明细',
    link: '/bill-calendar',
    icon: <CalendarOutlined />,
  },
]

const Home = ({ accessiblePaths = [] }) => {
  const visibleQuickLinks = accessiblePaths.length
    ? quickLinks.filter((item) => accessiblePaths.includes(item.link))
    : quickLinks
  const primaryAction = visibleQuickLinks[0]

  return (
    <div className="home-dashboard">
      <section className="home-summary page-panel">
        <div>
          <h2>记账本后台</h2>
          <p>管理本地账单数据、查看支出统计、整理每日明细。</p>
        </div>
        {primaryAction && (
          <Link className="home-primary-action" to={primaryAction.link}>
            {primaryAction.icon}
            {primaryAction.title}
          </Link>
        )}
      </section>

      <section className="home-quick-grid">
        {visibleQuickLinks.map((item) => (
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
