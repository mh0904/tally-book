import request from './request'

export const getMenus = () => {
  return request.get('/menus')
}

export const updateMenus = (menus) => {
  return request.put('/menus', menus)
}
