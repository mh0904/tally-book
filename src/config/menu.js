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
    return []
  }

  return sortMenuTree(menus.map((item, index) => normalizeMenu(item, index)))
}
