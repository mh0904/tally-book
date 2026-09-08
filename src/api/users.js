import request from '../utils/request'

// 成员登录校验，返回匹配的账号和角色信息。
export const login = (credentials) => {
  return request.post('/login', credentials)
}

// 获取成员账号配置列表。
export const getUsers = () => {
  return request.get('/users')
}

// 保存成员账号、密码、状态和角色绑定配置。
export const updateUsers = (users) => {
  return request.put('/users', users)
}

// 将成员配置恢复为默认配置。
export const resetUsers = () => {
  return request.post('/users/reset')
}
