import request from '../utils/request'

export const login = (credentials) => {
  return request.post('/login', credentials)
}

export const getUsers = () => {
  return request.get('/users')
}

export const updateUsers = (users) => {
  return request.put('/users', users)
}

export const resetUsers = () => {
  return request.post('/users/reset')
}
