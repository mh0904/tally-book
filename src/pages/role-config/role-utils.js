import {
  ADMIN_ROLE_ID,
  ALL_MENU_PERMISSION,
  getAllMenuIds,
} from '../../config/roles'

export const createRoleId = () =>
  `role-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const getNextSort = (roles) => {
  const maxSort = roles.reduce(
    (max, role) => Math.max(max, Number(role.sort || 0)),
    0
  )

  return maxSort + 1
}

export const findRoleById = (roles, id) => roles.find((role) => role.id === id)

export const getRoleCheckedKeys = (role, menus) => {
  if (!role) {
    return []
  }

  if (role.id === ADMIN_ROLE_ID || role.menuIds?.includes(ALL_MENU_PERMISSION)) {
    return getAllMenuIds(menus)
  }

  return role.menuIds || []
}
