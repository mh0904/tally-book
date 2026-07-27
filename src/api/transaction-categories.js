import request from '../utils/request'

// 获取后端维护的交易分类配置，支持按收入/支出类型筛选。
export const getTransactionCategories = (params) => {
  return request.get('/transaction-categories', { params })
}

// 保存交易分类配置。
export const updateTransactionCategories = (categories) => {
  return request.put('/transaction-categories', categories)
}

// 将交易分类恢复为默认配置。
export const resetTransactionCategories = () => {
  return request.post('/transaction-categories/reset')
}
