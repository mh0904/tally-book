// server-src/utils/transactionHelper.js
const { getMonthData, writeMonthData, DATA_DIR } = require('./fileHelper')
const { generateId } = require('./idGenerator')
const fs = require('fs')

// 验证日期字段
exports.validateDateField = (data) => {
  if (!data.date) {
    throw new Error('缺少 date 字段')
  }
}

// 从日期提取年月标识
exports.extractMonthKey = (date) => {
  const [year, month] = date.split('-')
  return `${year}-${month}`
}

// 处理单个交易项
exports.processTransaction = (item, transactions) => {
  this.validateDateField(item)
  const newItem = { ...item, id: generateId(transactions) }
  return newItem
}

// 获取所有交易数据
exports.getAllTransactions = () => {
  let allTransactions = []
  fs.readdirSync(DATA_DIR).forEach((file) => {
    if (file.endsWith('.json')) {
      const monthKey = file.replace('.json', '')
      const monthData = getMonthData(monthKey)
      allTransactions = allTransactions.concat(monthData.transactions || [])
    }
  })
  return allTransactions
}
