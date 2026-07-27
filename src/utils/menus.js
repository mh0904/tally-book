import request from './request'

export const getMenus = () => {
  return request.get('/menus')
}

export const updateMenus = (menus) => {
  return request.put('/menus', menus)
}

export const resetMenus = () => {
  return request.post('/menus/reset')
}
