import request from '../utils/request'

// 获取后端维护的交易分类配置。
export const getTransactionCategories = () => {
  return request.get('/transaction-categories')
}

// 保存交易分类配置。
export const updateTransactionCategories = (categories) => {
  return request.put('/transaction-categories', categories)
}

// 将交易分类恢复为默认配置。
export const resetTransactionCategories = () => {
  return request.post('/transaction-categories/reset')
}
