import request from '../utils/request'

// 用户登录校验，返回匹配的账号和角色信息。
export const login = (credentials) => {
  return request.post('/login', credentials)
}

// 获取用户账号配置列表。
export const getUsers = () => {
  return request.get('/users')
}

// 保存用户账号、密码、状态和角色绑定配置。
export const updateUsers = (users) => {
  return request.put('/users', users)
}

// 将用户配置恢复为默认配置。
export const resetUsers = () => {
  return request.post('/users/reset')
}
