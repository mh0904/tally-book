import request from '../utils/request'

// 获取角色列表和角色菜单权限配置。
export const getRoles = () => {
  return request.get('/roles')
}

// 保存角色列表和角色菜单权限配置。
export const updateRoles = (roles) => {
  return request.put('/roles', roles)
}

// 将角色配置恢复为默认配置。
export const resetRoles = () => {
  return request.post('/roles/reset')
}
