const { getMonthData, writeMonthData } = require('../utils/fileHelper')
const {
  validateDateField,
  extractMonthKey,
  processTransaction,
  getAllTransactions,
} = require('../utils/transactionHelper')

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
      res.status(200).json(processedItem)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  // 查询所有交易
  server.get('/transactions', (req, res) => {
    try {
      const allTransactions = getAllTransactions()
      res.json({
        code: 200,
        data: allTransactions,
        msg: '查询交易成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询交易失败：${error.message}`,
      })
    }
  })

  // 批量添加交易（所有记录日期相同）
  server.post('/transactions/batch', (req, res) => {
    try {
      const batchData = req.body
      // 验证请求体是否为数组
      if (!Array.isArray(batchData) || batchData.length === 0) {
        throw new Error('请求体必须是非空数组')
      }
      // 提取第一条数据的日期（所有记录日期相同）
      const firstItem = batchData[0]
      validateDateField(firstItem)
      // 统一提取年-月（所有记录共用）
      const monthKey = extractMonthKey(firstItem.date)
      const monthData = getMonthData(monthKey)
      const transactions = monthData.transactions

      // 为每条数据生成ID并处理
      const processedItems = batchData.map((item) => {
        // 确保所有记录日期一致
        if (item.date !== firstItem.date) {
          throw new Error(
            `日期不一致：${item.date} 与 ${firstItem.date} 不匹配`
          )
        }
        return processTransaction(item, transactions)
      })
      // 批量追加数据
      transactions.push(...processedItems)
      // 写入对应月份文件
      writeMonthData(monthKey, { transactions })
      // 返回处理后的结果
      res.status(200).json(processedItems)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })
}

module.exports = { setupTransactionRoutes }
