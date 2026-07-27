// src/components/Navbar.js
import { NavLink } from 'react-router-dom'
import {
  CalendarOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import './index.less'

let linkList = [
  {
    title: '首页',
    link: '/',
    icon: <HomeOutlined />,
  },
  {
    title: '流水管理',
    link: '/transactions',
    icon: <UnorderedListOutlined />,
  },
  {
    title: '图表分析',
    link: '/chart',
    icon: <PieChartOutlined />,
  },
  {
    title: '每日账单',
    link: '/daily-bills',
    icon: <CalendarOutlined />,
  },
]

const Navbar = ({ collapsed, onToggle }) => {
  return (
    <aside className={collapsed ? 'nav-bar collapsed' : 'nav-bar'}>
      <div className="brand">
        <div className="brand-mark">T</div>
        <div className="brand-info">
          <div className="brand-title">Tally Book</div>
          <div className="brand-subtitle">账本后台</div>
        </div>
        <button
          aria-label={collapsed ? '展开菜单' : '收起菜单'}
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? '展开菜单' : '收起菜单'}
          type="button"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      <nav className="nav-menu">
        {linkList.map((item) => {
          return (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
              end={item.link === '/'}
              key={item.link}
              title={item.title}
              to={item.link}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.title}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
export default Navbar
