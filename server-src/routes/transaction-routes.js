const { getMonthData, writeMonthData } = require('../utils/file-helper')
const {
  sendError,
  sendFail,
  sendSuccess,
} = require('../utils/response-helper')
const {
  validateDateField,
  extractMonthKey,
  processTransaction,
  getAllTransactions,
  updateTransaction,
  deleteTransaction,
  exportAllTransactions,
  importTransactions,
} = require('../utils/transaction-helper')

// 处理交易相关路由
const setupTransactionRoutes = (server) => {
  // 新增交易
  server.post('/transactions', (req, res) => {
    try {
      const newItem = req.body
      validateDateField(newItem)
      const monthKey = extractMonthKey(newItem.date)
      const monthData = getMonthData(monthKey)
      const transactions = monthData.transactions
      const processedItem = processTransaction(newItem, transactions)
      transactions.push(processedItem)
      writeMonthData(monthKey, { transactions })
      sendSuccess(res, processedItem, '账单添加成功')
    } catch (error) {
      sendError(res, '账单添加失败', error)
    }
  })

  // 查询所有交易（已改造，支持筛选）
  server.get('/transactions', (req, res) => {
    try {
      // 获取所有原始数据（已在getAllTransactions函数中进行筛选）
      const allTransactions = getAllTransactions(req.query)

      // 返回筛选后的数据
      sendSuccess(res, allTransactions, '查询交易成功')
    } catch (error) {
      sendError(res, '查询交易失败', error)
    }
  })

  // 【新增】更新单条交易记录 (PUT)
  server.put('/transactions/:id', (req, res) => {
    try {
      const id = req.params.id // 从 URL 参数中获取要更新的 ID
      const updatedItem = req.body // 从请求体中获取更新的数据
      if (updatedItem.date) {
        validateDateField(updatedItem)
      }
      const updatedTransaction = updateTransaction(id, updatedItem)

      if (!updatedTransaction) {
        return sendFail(res, `未找到 ID 为 ${id} 的交易记录`, 404)
      }

      sendSuccess(res, updatedTransaction, '账单更新成功')
    } catch (error) {
      sendError(res, '账单更新失败', error)
    }
  })

  // 批量添加交易（支持不同日期）
  server.post('/transactions/batch', (req, res) => {
    try {
      const batchData = req.body
      // 验证请求体是否为数组
      if (!Array.isArray(batchData) || batchData.length === 0) {
        throw new Error('请求体必须是非空数组')
      }
      
      const processedItems = []
      const monthDataMap = new Map() // 按月份存储数据，减少文件IO
      
      // 第一阶段：处理所有记录并按月份分组
      for (const item of batchData) {
        validateDateField(item)
        // 为每条记录单独提取年份和月份
        const monthKey = extractMonthKey(item.date)
        
        // 获取或创建该月份的数据
        if (!monthDataMap.has(monthKey)) {
          const monthData = getMonthData(monthKey)
          monthDataMap.set(monthKey, monthData)
        }
        
        const monthData = monthDataMap.get(monthKey)
        const transactions = monthData.transactions
        
        // 处理单条记录
        const processedItem = processTransaction(item, transactions)
        // 添加到当前月份的交易列表
        transactions.push(processedItem)
        // 记录处理后的结果
        processedItems.push(processedItem)
      }
      
      // 第二阶段：按月份批量写入文件（减少IO次数）
      for (const [monthKey, monthData] of monthDataMap.entries()) {
        writeMonthData(monthKey, { transactions: monthData.transactions })
      }
      
      // 返回处理后的结果
      sendSuccess(res, processedItems, '批量添加交易成功')
    } catch (error) {
      sendError(res, '批量添加交易失败', error)
    }
  })

  // 【新增】删除单条交易记录 (DELETE)
  server.delete('/transactions/:id', (req, res) => {
    try {
      const id = req.params.id // 从 URL 参数中获取 ID

      // 调用删除辅助函数，它会处理查找和文件写入
      const deletedTransaction = deleteTransaction(id)

      if (!deletedTransaction) {
        // 如果 helper 返回 null，表示未找到
        return sendFail(res, `未找到 ID 为 ${id} 的交易记录`, 404)
      }

      // 返回被删除的记录，并发送 200 或 204 No Content
      // 这里返回 200 并带上数据，方便前端确认
      sendSuccess(res, deletedTransaction, `成功删除 ID 为 ${id} 的交易记录`)
    } catch (error) {
      // 捕获可能的文件操作错误等
      sendError(res, '删除失败', error)
    }
  })

  // 导出所有交易数据
  server.get('/transactions/export', (req, res) => {
    try {
      const allData = exportAllTransactions()
      sendSuccess(res, allData, '数据导出成功')
    } catch (error) {
      console.error('导出数据失败:', error)
      sendError(res, '导出数据失败', error)
    }
  })

  // 导入交易数据
  server.post('/transactions/import', (req, res) => {
    try {
      const importData = req.body
      if (!importData || typeof importData !== 'object') {
        return sendFail(res, '导入数据格式错误')
      }

      const result = importTransactions(importData)
      if (result.success) {
        sendSuccess(
          res,
          null,
          `数据导入成功，共导入 ${result.imported} 条记录，${result.errors} 条记录导入失败`
        )
      } else {
        sendFail(res, `数据导入失败: ${result.message}`, 500)
      }
    } catch (error) {
      console.error('导入数据失败:', error)
      sendError(res, '导入数据失败', error)
    }
  })
}

module.exports = { setupTransactionRoutes }
