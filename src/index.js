// src/index.js
import React from 'react'
import './index.less'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { Avatar, ConfigProvider, Dropdown, message } from 'antd'
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 配置dayjs使用中文本地化
dayjs.locale('zh-cn')
// 导入页面组件
import Home from './pages/home'
import Login from './pages/login'
import MenuConfig from './pages/menuConfig'
import Transactions from './pages/transactions/index.jsx'
import Chart from './pages/chart/index.jsx'
import DailyBills from './pages/dailyBills/index.jsx'
import { normalizeMenuTree } from './config/menu'
import { getMenus, updateMenus } from './utils/menus'

// 导入导航栏
import Navbar from './components/navBar/index.jsx'

const AUTH_KEY = 'tally-book-login'
const USER_KEY = 'tally-book-user'
const AVATAR_COLOR_KEY = 'tally-book-avatar-color'
const AVATAR_COLORS = [
  '#14b8a6',
  '#0ea5e9',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#22c55e',
  '#64748b',
]

const getUserName = () => localStorage.getItem(USER_KEY) || 'admin'

const getAvatarText = (name) => {
  const normalizedName = String(name || '').trim()

  if (!normalizedName) {
    return 'U'
  }

  const chineseInitial = normalizedName.match(/[\u4e00-\u9fff]/)
  if (chineseInitial) {
    return chineseInitial[0]
  }

  const englishInitial = normalizedName.match(/[a-zA-Z]/)
  if (englishInitial) {
    return englishInitial[0].toUpperCase()
  }

  return normalizedName[0].toUpperCase()
}

const createAvatarColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

const getAvatarColor = () => {
  const savedColor = localStorage.getItem(AVATAR_COLOR_KEY)

  if (savedColor) {
    return savedColor
  }

  const nextColor = createAvatarColor()
  localStorage.setItem(AVATAR_COLOR_KEY, nextColor)
  return nextColor
}

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
  '/menu-config': {
    title: '菜单配置',
    description: '后台菜单维护',
  },
}

// 根组件（包含导航栏和路由出口）
const App = () => {
  const location = useLocation()
  const currentPage = pageMeta[location.pathname] || pageMeta['/']
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [menus, setMenus] = React.useState([])
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => localStorage.getItem(AUTH_KEY) === 'true'
  )
  const [userName, setUserName] = React.useState(getUserName)
  const [avatarColor, setAvatarColor] = React.useState(getAvatarColor)
  const avatarText = React.useMemo(() => getAvatarText(userName), [userName])

  const refreshMenus = React.useCallback(async () => {
    const { code, data, msg } = await getMenus()

    if (code !== 200) {
      throw new Error(msg || '菜单加载失败')
    }

    const refreshedMenus = normalizeMenuTree(data)
    setMenus(refreshedMenus)
    return refreshedMenus
  }, [])

  const handleLogin = (name) => {
    const nextUserName = String(name || 'admin').trim() || 'admin'
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(USER_KEY, nextUserName)
    setUserName(nextUserName)
    setAvatarColor(getAvatarColor())
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  React.useEffect(() => {
    let mounted = true

    const fetchMenus = async () => {
      try {
        const { code, data, msg } = await getMenus()

        if (!mounted) {
          return
        }

        if (code === 200) {
          setMenus(normalizeMenuTree(data))
        } else {
          message.error(msg || '菜单加载失败')
        }
      } catch (error) {
        // request 拦截器已经做了统一错误提示，这里保留默认菜单兜底。
      }
    }

    fetchMenus()

    return () => {
      mounted = false
    }
  }, [])

  const handleMenusChange = async (nextMenus) => {
    const normalizedMenus = normalizeMenuTree(nextMenus)
    const { code, msg } = await updateMenus(normalizedMenus)

    if (code !== 200) {
      throw new Error(msg || '菜单保存失败')
    }

    return refreshMenus()
  }

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      message.info('个人中心暂未开放')
      return
    }

    if (key === 'logout') {
      handleLogout()
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ]

  if (location.pathname === '/login') {
    if (isAuthenticated) {
      return <Navigate to="/" replace />
    }

    return <Login onLogin={handleLogin} />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <div className="admin-shell">
      <Navbar
        collapsed={sidebarCollapsed}
        menus={menus}
        onToggle={() => setSidebarCollapsed((value) => !value)}
      />
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{currentPage.title}</h1>
            <span>{currentPage.description}</span>
          </div>
          <div className="admin-actions">
            <div className="admin-date">{dayjs().format('YYYY年MM月DD日')}</div>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button className="user-trigger" type="button">
                <Avatar
                  className="user-avatar"
                  size={30}
                  style={{ backgroundColor: avatarColor }}
                >
                  {avatarText}
                </Avatar>
                <span className="user-name">{userName}</span>
                <DownOutlined className="user-caret" />
              </button>
            </Dropdown>
          </div>
        </header>
        <section className="admin-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/daily-bills" element={<DailyBills />} />
            <Route
              path="/menu-config"
              element={
                <MenuConfig
                  menus={menus}
                  onMenusChange={handleMenusChange}
                  onMenusRefresh={refreshMenus}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
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
