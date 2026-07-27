import request from '../utils/request'

// 获取后台菜单树配置。
export const getMenus = () => {
  return request.get('/menus')
}

// 保存后台菜单树配置。
export const updateMenus = (menus) => {
  return request.put('/menus', menus)
}

// 将后台菜单树恢复为默认配置。
export const resetMenus = () => {
  return request.post('/menus/reset')
}
