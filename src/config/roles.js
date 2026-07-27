export const ADMIN_ROLE_ID = 'admin'
export const ALL_MENU_PERMISSION = '*'

export const DEFAULT_ROLE = {
  id: ADMIN_ROLE_ID,
  name: '管理员',
  description: '拥有全部菜单和系统管理权限',
  enabled: true,
  sort: 1,
  menuIds: [ALL_MENU_PERMISSION],
  builtin: true,
}

export const sortRoles = (roles = []) =>
  [...roles].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

export const normalizeMenuIds = (menuIds) => {
  if (!Array.isArray(menuIds)) {
    return []
  }

  return [...new Set(menuIds.filter(Boolean).map(String))]
}

export const normalizeRole = (role, fallbackIndex = 0) => {
  const isAdmin = role?.id === ADMIN_ROLE_ID

  return {
    id: role?.id || `role-${Date.now()}-${fallbackIndex}`,
    name: role?.name || '未命名角色',
    description: role?.description || '',
    enabled: isAdmin ? true : role?.enabled !== false,
    sort: Number(role?.sort || fallbackIndex + 1),
    menuIds: isAdmin
      ? [ALL_MENU_PERMISSION]
      : normalizeMenuIds(role?.menuIds),
    builtin: Boolean(role?.builtin || isAdmin),
  }
}

export const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) {
    return [DEFAULT_ROLE]
  }

  const normalizedRoles = roles.map((role, index) => normalizeRole(role, index))
  const hasAdmin = normalizedRoles.some((role) => role.id === ADMIN_ROLE_ID)
  const nextRoles = hasAdmin
    ? normalizedRoles.map((role) =>
        role.id === ADMIN_ROLE_ID ? normalizeRole({ ...DEFAULT_ROLE, ...role }) : role
      )
    : [DEFAULT_ROLE, ...normalizedRoles]

  return sortRoles(nextRoles)
}

export const isAdminRole = (role) => role?.id === ADMIN_ROLE_ID

export const hasAllMenuPermission = (role) =>
  isAdminRole(role) || role?.menuIds?.includes(ALL_MENU_PERMISSION)

export const roleHasMenuId = (role, menuId) => {
  if (!role || role.enabled === false || !menuId) {
    return false
  }

  return hasAllMenuPermission(role) || role.menuIds?.includes(menuId)
}

export const getAllMenuIds = (menus = []) =>
  menus.reduce((ids, item) => {
    return [...ids, item.id, ...getAllMenuIds(item.children || [])]
  }, [])

export const filterMenuTreeByRole = (menus = [], role) => {
  if (!role || role.enabled === false) {
    return []
  }

  if (hasAllMenuPermission(role)) {
    return menus
  }

  return menus.reduce((items, item) => {
    const children = filterMenuTreeByRole(item.children || [], role)
    const authorized = roleHasMenuId(role, item.id) || children.length > 0

    if (!authorized) {
      return items
    }

    items.push({
      ...item,
      children: children.length ? children : undefined,
    })

    return items
  }, [])
}

export const findMenuByPath = (menus = [], pathname, parentEnabled = true) => {
  for (const item of menus) {
    const enabled = parentEnabled && item.enabled !== false

    if (item.path === pathname) {
      return {
        item,
        enabled,
      }
    }

    if (item.children?.length) {
      const found = findMenuByPath(item.children, pathname, enabled)

      if (found) {
        return found
      }
    }
  }

  return null
}

export const canAccessMenuPath = (menus = [], role, pathname) => {
  const found = findMenuByPath(menus, pathname)

  if (!found || !found.enabled) {
    return false
  }

  return roleHasMenuId(role, found.item.id)
}

export const getFirstAccessibleMenuPath = (menus = [], parentEnabled = true) => {
  for (const item of menus) {
    const enabled = parentEnabled && item.enabled !== false

    if (enabled && item.path?.startsWith('/')) {
      return item.path
    }

    if (item.children?.length) {
      const childPath = getFirstAccessibleMenuPath(item.children, enabled)

      if (childPath) {
        return childPath
      }
    }
  }

  return '/'
}

export const getAccessibleMenuPaths = (menus = [], parentEnabled = true) =>
  menus.reduce((paths, item) => {
    const enabled = parentEnabled && item.enabled !== false
    const ownPath = enabled && item.path?.startsWith('/') ? [item.path] : []

    return [
      ...paths,
      ...ownPath,
      ...getAccessibleMenuPaths(item.children || [], enabled),
    ]
  }, [])
