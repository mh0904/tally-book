import request from '../utils/request'

export const getRoles = () => {
  return request.get('/roles')
}

export const updateRoles = (roles) => {
  return request.put('/roles', roles)
}

export const resetRoles = () => {
  return request.post('/roles/reset')
}
