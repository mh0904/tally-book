export const defaultMenuConfig = [
  {
    id: 'business',
    title: '业务菜单',
    icon: 'app',
    path: '',
    enabled: true,
    sort: 1,
    children: [
      {
        id: 'home',
        title: '首页',
        icon: 'home',
        path: '/',
        enabled: true,
        sort: 1,
      },
      {
        id: 'transactions',
        title: '流水管理',
        icon: 'list',
        path: '/transactions',
        enabled: true,
        sort: 2,
      },
      {
        id: 'chart',
        title: '图表分析',
        icon: 'chart',
        path: '/chart',
        enabled: true,
        sort: 3,
      },
      {
        id: 'daily-bills',
        title: '每日账单',
        icon: 'calendar',
        path: '/daily-bills',
        enabled: true,
        sort: 4,
      },
    ],
  },
  {
    id: 'system',
    title: '系统管理',
    icon: 'setting',
    path: '',
    enabled: true,
    sort: 99,
    children: [
      {
        id: 'menu-config',
        title: '菜单配置',
        icon: 'menu',
        path: '/menu-config',
        enabled: true,
        sort: 1,
      },
    ],
  },
]

export const sortMenuTree = (menus = []) =>
  menus
    .map((item) => ({
      ...item,
      children: item.children ? sortMenuTree(item.children) : undefined,
    }))
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

export const normalizeMenu = (item, fallbackIndex) => ({
  id: item.id || `menu-${Date.now()}-${fallbackIndex}`,
  title: item.title || '未命名菜单',
  icon: item.icon || 'app',
  path: item.path || '',
  enabled: item.enabled !== false,
  sort: Number(item.sort || fallbackIndex + 1),
  children: Array.isArray(item.children)
    ? item.children.map((child, index) => normalizeMenu(child, index))
    : undefined,
})

export const normalizeMenuTree = (menus) => {
  if (!Array.isArray(menus)) {
    return sortMenuTree(defaultMenuConfig)
  }

  return sortMenuTree(menus.map((item, index) => normalizeMenu(item, index)))
}
