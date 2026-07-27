export const ADMIN_USER_ID = 'admin'
export const DEFAULT_ADMIN_USER = {
  id: ADMIN_USER_ID,
  username: 'admin',
  name: '管理员',
  roleId: 'admin',
  enabled: true,
  sort: 1,
  builtin: true,
}

export const sortUsers = (users = []) =>
  [...users].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

export const normalizeUser = (user, fallbackIndex = 0) => {
  const username = String(user?.username || '').trim()
  const isAdmin = user?.id === ADMIN_USER_ID || username === ADMIN_USER_ID

  return {
    id: isAdmin ? ADMIN_USER_ID : user?.id || `user-${Date.now()}-${fallbackIndex}`,
    username: isAdmin ? ADMIN_USER_ID : username,
    name: String(user?.name || username || '未命名用户').trim(),
    roleId: isAdmin ? 'admin' : user?.roleId || 'viewer',
    enabled: isAdmin ? true : user?.enabled !== false,
    sort: Number(user?.sort || fallbackIndex + 1),
    builtin: Boolean(user?.builtin || isAdmin),
    ...(user?.password ? { password: user.password } : {}),
  }
}

export const normalizeUsers = (users) => {
  if (!Array.isArray(users)) {
    return [DEFAULT_ADMIN_USER]
  }

  const normalizedUsers = users.map((user, index) => normalizeUser(user, index))
  const hasAdmin = normalizedUsers.some((user) => user.id === ADMIN_USER_ID)
  const nextUsers = hasAdmin
    ? normalizedUsers.map((user) =>
        user.id === ADMIN_USER_ID
          ? normalizeUser({ ...DEFAULT_ADMIN_USER, ...user })
          : user
      )
    : [DEFAULT_ADMIN_USER, ...normalizedUsers]

  return sortUsers(nextUsers)
}

export const getUserDisplayName = (user) =>
  user?.name || user?.username || DEFAULT_ADMIN_USER.name
