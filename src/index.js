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
  useNavigate,
} from 'react-router-dom'
import { Avatar, ConfigProvider, Dropdown, Tag, message } from 'antd'
import {
  CheckOutlined,
  DownOutlined,
  LogoutOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 配置dayjs使用中文本地化
dayjs.locale('zh-cn')
// 导入页面组件
import Home from './pages/home'
import Login from './pages/login'
import MenuConfig from './pages/menu-config'
import RoleConfig from './pages/role-config'
import Transactions from './pages/transactions/index.jsx'
import Chart from './pages/chart/index.jsx'
import DailyBills from './pages/daily-bills/index.jsx'
import { normalizeMenuTree } from './config/menu'
import {
  ADMIN_ROLE_ID,
  canAccessMenuPath,
  filterMenuTreeByRole,
  getAccessibleMenuPaths,
  getFirstAccessibleMenuPath,
  normalizeRoles,
} from './config/roles'
import { getMenus, updateMenus } from './api/menus'
import { getRoles, updateRoles } from './api/roles'

// 导入导航栏
import Sidebar from './components/sidebar/index.jsx'

const AUTH_KEY = 'tally-book-login'
const USER_KEY = 'tally-book-user'
const ROLE_KEY = 'tally-book-role'
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

const getSavedRoleId = () => localStorage.getItem(ROLE_KEY) || ADMIN_ROLE_ID

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
  '/role-config': {
    title: '角色管理',
    description: '角色与菜单权限维护',
  },
}

// 根组件（包含导航栏和路由出口）
const App = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = pageMeta[location.pathname] || pageMeta['/']
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [menus, setMenus] = React.useState([])
  const [roles, setRoles] = React.useState([])
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => localStorage.getItem(AUTH_KEY) === 'true'
  )
  const [userName, setUserName] = React.useState(getUserName)
  const [currentRoleId, setCurrentRoleId] = React.useState(getSavedRoleId)
  const [avatarColor, setAvatarColor] = React.useState(getAvatarColor)
  const avatarText = React.useMemo(() => getAvatarText(userName), [userName])
  const enabledRoles = React.useMemo(
    () => roles.filter((role) => role.enabled !== false),
    [roles]
  )
  const currentRole = React.useMemo(() => {
    return (
      enabledRoles.find((role) => role.id === currentRoleId) ||
      enabledRoles.find((role) => role.id === ADMIN_ROLE_ID) ||
      enabledRoles[0] ||
      null
    )
  }, [currentRoleId, enabledRoles])
  const visibleMenus = React.useMemo(
    () => filterMenuTreeByRole(menus, currentRole),
    [menus, currentRole]
  )
  const firstAccessiblePath = React.useMemo(
    () => getFirstAccessibleMenuPath(visibleMenus),
    [visibleMenus]
  )
  const accessibleMenuPaths = React.useMemo(
    () => getAccessibleMenuPaths(visibleMenus),
    [visibleMenus]
  )
  const accessReady = Boolean(menus.length > 0 && roles.length > 0 && currentRole)

  const refreshMenus = React.useCallback(async () => {
    const { code, data, msg } = await getMenus()

    if (code !== 200) {
      throw new Error(msg || '菜单加载失败')
    }

    const refreshedMenus = normalizeMenuTree(data)
    setMenus(refreshedMenus)
    return refreshedMenus
  }, [])

  const refreshRoles = React.useCallback(async () => {
    const { code, data, msg } = await getRoles()

    if (code !== 200) {
      throw new Error(msg || '角色加载失败')
    }

    const refreshedRoles = normalizeRoles(data)
    setRoles(refreshedRoles)
    return refreshedRoles
  }, [])

  const handleLogin = (name) => {
    const nextUserName = String(name || 'admin').trim() || 'admin'
    const nextRoleId = getSavedRoleId()
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(USER_KEY, nextUserName)
    localStorage.setItem(ROLE_KEY, nextRoleId)
    setUserName(nextUserName)
    setCurrentRoleId(nextRoleId)
    setAvatarColor(getAvatarColor())
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }

  React.useEffect(() => {
    let mounted = true

    const fetchAppConfig = async () => {
      try {
        const [menusResult, rolesResult] = await Promise.all([
          getMenus(),
          getRoles(),
        ])

        if (!mounted) {
          return
        }

        if (menusResult.code === 200) {
          setMenus(normalizeMenuTree(menusResult.data))
        } else {
          message.error(menusResult.msg || '菜单加载失败')
        }

        if (rolesResult.code === 200) {
          setRoles(normalizeRoles(rolesResult.data))
        } else {
          message.error(rolesResult.msg || '角色加载失败')
        }
      } catch (error) {
        // request 拦截器已经做了统一错误提示，这里保留默认菜单兜底。
      }
    }

    fetchAppConfig()

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

  const handleRolesChange = async (nextRoles) => {
    const normalizedRoles = normalizeRoles(nextRoles)
    const { code, msg } = await updateRoles(normalizedRoles)

    if (code !== 200) {
      throw new Error(msg || '角色保存失败')
    }

    return refreshRoles()
  }

  React.useEffect(() => {
    if (!currentRole?.id || currentRole.id === currentRoleId) {
      return
    }

    localStorage.setItem(ROLE_KEY, currentRole.id)
    setCurrentRoleId(currentRole.id)
  }, [currentRole, currentRoleId])

  React.useEffect(() => {
    if (
      !isAuthenticated ||
      location.pathname === '/login' ||
      !accessReady ||
      canAccessMenuPath(menus, currentRole, location.pathname)
    ) {
      return
    }

    navigate(firstAccessiblePath, { replace: true })
  }, [
    accessReady,
    currentRole,
    firstAccessiblePath,
    isAuthenticated,
    location.pathname,
    menus,
    navigate,
  ])

  const renderProtectedPage = (path, element) => {
    if (!accessReady || canAccessMenuPath(menus, currentRole, path)) {
      return element
    }

    return <Navigate to={firstAccessiblePath} replace />
  }

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      message.info('个人中心暂未开放')
      return
    }

    if (key?.startsWith('role:')) {
      const nextRoleId = key.replace('role:', '')
      const nextRole = enabledRoles.find((role) => role.id === nextRoleId)

      if (!nextRole) {
        message.warning('角色不可用')
        return
      }

      localStorage.setItem(ROLE_KEY, nextRole.id)
      setCurrentRoleId(nextRole.id)
      message.success(`已切换为${nextRole.name}`)
      return
    }

    if (key === 'logout') {
      handleLogout()
    }
  }

  const roleMenuItems = enabledRoles.map((role) => ({
    key: `role:${role.id}`,
    disabled: role.id === currentRole?.id,
    icon: role.id === currentRole?.id ? <CheckOutlined /> : <SafetyOutlined />,
    label: role.name,
  }))

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
      key: 'role-switch',
      icon: <SafetyOutlined />,
      label: `当前角色：${currentRole?.name || '未加载'}`,
      children: roleMenuItems,
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
      <Sidebar
        collapsed={sidebarCollapsed}
        menus={visibleMenus}
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
            {currentRole && (
              <Tag
                className="current-role-tag"
                color={currentRole.id === ADMIN_ROLE_ID ? 'gold' : 'blue'}
              >
                {currentRole.name}
              </Tag>
            )}
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
            <Route
              path="/"
              element={renderProtectedPage(
                '/',
                <Home accessiblePaths={accessibleMenuPaths} />
              )}
            />
            <Route
              path="/transactions"
              element={renderProtectedPage('/transactions', <Transactions />)}
            />
            <Route
              path="/chart"
              element={renderProtectedPage('/chart', <Chart />)}
            />
            <Route
              path="/daily-bills"
              element={renderProtectedPage('/daily-bills', <DailyBills />)}
            />
            <Route
              path="/menu-config"
              element={renderProtectedPage(
                '/menu-config',
                <MenuConfig
                  menus={menus}
                  onMenusChange={handleMenusChange}
                  onMenusRefresh={refreshMenus}
                />
              )}
            />
            <Route
              path="/role-config"
              element={renderProtectedPage(
                '/role-config',
                <RoleConfig
                  menus={menus}
                  onRolesChange={handleRolesChange}
                  onRolesRefresh={refreshRoles}
                  roles={roles}
                />
              )}
            />
            <Route
              path="*"
              element={<Navigate to={firstAccessiblePath} replace />}
            />
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
