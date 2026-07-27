import request from '../utils/request'

// 查询交易记录列表，支持日期范围、类型、分类、描述和月份筛选。
export const getAllTransactions = (data) => {
  return request.get('/transactions', { params: data })
}

// 根据交易 ID 获取单条交易记录。
export const getTransactionsById = (id) => {
  return request.get(`/transactions/${id}`)
}

// 新增单条交易记录。
export const addTransactions = (data) => {
  return request.post('/transactions', data)
}

// 批量新增交易记录。
export const batchAddTransactions = (dataList) => {
  return request.post('/transactions/batch', dataList)
}

// 根据交易 ID 更新交易记录。
export const updateTransactions = (id, data) => {
  return request.put(`/transactions/${id}`, data)
}

// 根据交易 ID 删除交易记录。
export const deleteTransactions = (id) => {
  return request.delete(`/transactions/${id}`)
}

// 导出全部交易记录。
export const exportAllTransactions = () => {
  return request.get('/transactions/export')
}

// 导入交易记录数据。
export const importTransactions = (data) => {
  return request.post('/transactions/import', data)
}
