import request from './request'

// 记账记录相关接口
export const transactionApi = {
  // 获取所有记录
  getAllTransactions: () => {
    return request.get('/transactions') //
  },

  // 获取单条记录（根据 ID）
  getTransactionsById: (id) => {
    return request.get(`/transactions/${id}`)
  },

  // 添加新记录
  addTransactions: (data) => {
    return request.post('/transactions', data)
  },

  // 更新记录
  updateTransactions: (id, data) => {
    return request.put(`/transactions/${id}`, data)
  },

  // 删除记录
  deleteTransactions: (id) => {
    return request.delete(`/transactions/${id}`)
  },
}
