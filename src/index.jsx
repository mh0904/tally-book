// src/index.jsx
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
  DownOutlined,
  LogoutOutlined,
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
import Discover from './pages/discover'
import MenuConfig from './pages/menu-config'
import Profile from './pages/profile'
import RoleConfig from './pages/role-config'
import UserConfig from './pages/user-config'
import Transactions from './pages/transactions/index.jsx'
import Chart from './pages/chart/index.jsx'
import BillCalendar from './pages/bill-calendar/index.jsx'
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
import { getTransactionCategories } from './api/transaction-categories'
import { getUsers, updateUsers } from './api/users'
import {
  ADMIN_USER_ID,
  getUserDisplayName,
  normalizeUsers,
} from './config/users'
import { normalizeTransactionCategoryField } from './config/transaction-categories'

// 导入导航栏
import Sidebar from './components/sidebar/index.jsx'

const AUTH_KEY = 'tally-book-login'
const USER_ID_KEY = 'tally-book-user-id'
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
const APP_ONLY_PATHS = ['/discover', '/profile']

const getUserName = () => localStorage.getItem(USER_KEY) || 'admin'

const getUserId = () => localStorage.getItem(USER_ID_KEY) || ADMIN_USER_ID

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
  '/bill-calendar': {
    title: '账单日历',
    description: '按日查看账单明细',
  },
  '/discover': {
    title: '发现',
    description: '快捷入口',
  },
  '/profile': {
    title: '我的',
    description: '个人中心',
  },
  '/menu-config': {
    title: '菜单配置',
    description: '后台菜单维护',
  },
  '/role-config': {
    title: '角色管理',
    description: '角色与菜单权限维护',
  },
  '/user-config': {
    title: '用户管理',
    description: '登录账号与密码维护',
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
  const [transactionCategoryField, setTransactionCategoryField] =
    React.useState(() => normalizeTransactionCategoryField())
  const [users, setUsers] = React.useState([])
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => localStorage.getItem(AUTH_KEY) === 'true'
  )
  const [currentUserId, setCurrentUserId] = React.useState(getUserId)
  const [userName, setUserName] = React.useState(getUserName)
  const [currentRoleId, setCurrentRoleId] = React.useState(getSavedRoleId)
  const [avatarColor, setAvatarColor] = React.useState(getAvatarColor)
  const avatarText = React.useMemo(() => getAvatarText(userName), [userName])
  const currentUser = React.useMemo(() => {
    return users.find((user) => user.id === currentUserId) || null
  }, [currentUserId, users])
  const enabledRoles = React.useMemo(
    () => roles.filter((role) => role.enabled !== false),
    [roles]
  )
  const currentRole = React.useMemo(() => {
    if (currentUser) {
      return enabledRoles.find((role) => role.id === currentUser.roleId) || null
    }

    return (
      enabledRoles.find((role) => role.id === currentRoleId) ||
      enabledRoles.find((role) => role.id === ADMIN_ROLE_ID) ||
      enabledRoles[0] ||
      null
    )
  }, [currentRoleId, currentUser, enabledRoles])
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
  const accessReady = Boolean(
    menus.length > 0 && roles.length > 0 && users.length > 0 && currentRole
  )

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

  const refreshUsers = React.useCallback(async () => {
    const { code, data, msg } = await getUsers()

    if (code !== 200) {
      throw new Error(msg || '用户加载失败')
    }

    const refreshedUsers = normalizeUsers(data)
    setUsers(refreshedUsers)
    return refreshedUsers
  }, [])

  const handleLogin = (user) => {
    const nextUser = user || {
      id: ADMIN_USER_ID,
      name: 'admin',
      roleId: ADMIN_ROLE_ID,
      username: 'admin',
    }
    const nextUserName = getUserDisplayName(nextUser)
    const nextRoleId = nextUser.roleId || ADMIN_ROLE_ID
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(USER_ID_KEY, nextUser.id)
    localStorage.setItem(USER_KEY, nextUserName)
    localStorage.setItem(ROLE_KEY, nextRoleId)
    setCurrentUserId(nextUser.id)
    setUserName(nextUserName)
    setCurrentRoleId(nextRoleId)
    setAvatarColor(getAvatarColor())
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_ID_KEY)
    localStorage.removeItem(ROLE_KEY)
    setIsAuthenticated(false)
  }

  React.useEffect(() => {
    let mounted = true

    const fetchAppConfig = async () => {
      try {
        const [
          menusResult,
          rolesResult,
          usersResult,
          categoriesResult,
        ] = await Promise.all([
          getMenus(),
          getRoles(),
          getUsers(),
          getTransactionCategories(),
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

        if (usersResult.code === 200) {
          setUsers(normalizeUsers(usersResult.data))
        } else {
          message.error(usersResult.msg || '用户加载失败')
        }

        if (categoriesResult.code === 200) {
          setTransactionCategoryField(
            normalizeTransactionCategoryField(categoriesResult.data)
          )
        } else {
          message.error(categoriesResult.msg || '交易分类加载失败')
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

  const handleUsersChange = async (nextUsers) => {
    const normalizedUsers = normalizeUsers(nextUsers)
    const { code, msg } = await updateUsers(normalizedUsers)

    if (code !== 200) {
      throw new Error(msg || '用户保存失败')
    }

    return refreshUsers()
  }

  React.useEffect(() => {
    if (!isAuthenticated || !users.length) {
      return
    }

    if (!currentUser || currentUser.enabled === false) {
      handleLogout()
      message.warning('当前用户不可用，请重新登录')
      return
    }

    if (
      roles.length > 0 &&
      !roles.some(
        (role) => role.id === currentUser.roleId && role.enabled !== false
      )
    ) {
      handleLogout()
      message.warning('当前用户角色不可用，请重新登录')
      return
    }

    const nextUserName = getUserDisplayName(currentUser)

    if (nextUserName !== userName) {
      localStorage.setItem(USER_KEY, nextUserName)
      setUserName(nextUserName)
    }

    if (currentUser.roleId && currentUser.roleId !== currentRoleId) {
      localStorage.setItem(ROLE_KEY, currentUser.roleId)
      setCurrentRoleId(currentUser.roleId)
    }
  }, [
    currentRoleId,
    currentUser,
    isAuthenticated,
    roles,
    userName,
    users.length,
  ])

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
      APP_ONLY_PATHS.includes(location.pathname) ||
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
    if (
      APP_ONLY_PATHS.includes(path) ||
      !accessReady ||
      canAccessMenuPath(menus, currentRole, path)
    ) {
      return element
    }

    return <Navigate to={firstAccessiblePath} replace />
  }

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile')
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
      label: '我的',
    },
    {
      type: 'divider',
    },
    {
      key: 'role-label',
      disabled: true,
      label: `当前角色：${currentRole?.name || '未加载'}`,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      danger: true,
      icon: <LogoutOutlined />,
      label: '退出',
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
          <div className="admin-title">
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
              element={renderProtectedPage(
                '/transactions',
                <Transactions transactionCategoryField={transactionCategoryField} />
              )}
            />
            <Route
              path="/chart"
              element={renderProtectedPage(
                '/chart',
                <Chart transactionCategoryField={transactionCategoryField} />
              )}
            />
            <Route
              path="/bill-calendar"
              element={renderProtectedPage(
                '/bill-calendar',
                <BillCalendar transactionCategoryField={transactionCategoryField} />
              )}
            />
            <Route
              path="/discover"
              element={renderProtectedPage('/discover', <Discover />)}
            />
            <Route
              path="/profile"
              element={renderProtectedPage(
                '/profile',
                <Profile
                  avatarColor={avatarColor}
                  avatarText={avatarText}
                  currentRole={currentRole}
                  onLogout={handleLogout}
                  userName={userName}
                />
              )}
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
              path="/user-config"
              element={renderProtectedPage(
                '/user-config',
                <UserConfig
                  currentUserId={currentUserId}
                  onUsersChange={handleUsersChange}
                  onUsersRefresh={refreshUsers}
                  roles={roles}
                  users={users}
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
