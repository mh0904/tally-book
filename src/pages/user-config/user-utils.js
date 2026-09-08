export const createUserId = () =>
  `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const getNextSort = (users) => {
  const maxSort = users.reduce(
    (max, user) => Math.max(max, Number(user.sort || 0)),
    0
  )

  return maxSort + 1
}

export const findUserById = (users, id) => users.find((user) => user.id === id)

export const getRoleName = (roles, roleId) =>
  roles.find((role) => role.id === roleId)?.name || '未分配角色'
