import request from './request'

// 获取所有记录
export const getAllTransactions = (data) => {
  return request.get('/transactions', { params: data })
}

// 获取单条记录（根据 ID）
export const getTransactionsById = (id) => {
  return request.get(`/transactions/${id}`)
}

// 添加新记录
export const addTransactions = (data) => {
  return request.post('/transactions', data)
}

// 批量添加记录
export const batchAddTransactions = (dataList) => {
  return request.post('/transactions/batch', dataList)
}

// 更新记录
export const updateTransactions = (id, data) => {
  return request.put(`/transactions/${id}`, data)
}

// 删除记录
export const deleteTransactions = (id) => {
  return request.delete(`/transactions/${id}`)
}
