// server-src/utils/transactionHelper.js
const { getMonthData, writeMonthData, DATA_DIR } = require('./fileHelper')
const { generateId } = require('./idGenerator')
const fs = require('fs')

/**
 * 验证数据中是否存在 date 字段。
 * @param {object} data - 交易数据对象。
 */
const validateDateField = (data) => {
  if (!data.date) {
    throw new Error('缺少 date 字段')
  }
}

/**
 * 从 'YYYY-MM-DD' 格式的日期中提取 'YYYY-MM' 标识。
 * @param {string} date - 日期字符串。
 * @returns {string} 月份键 (YYYY-MM)。
 */
const extractMonthKey = (date) => {
  validateDateField({ date }) // 确保日期存在
  // 假设 date 格式始终为 YYYY-MM-DD
  const parts = date.split('-')
  if (parts.length < 2) {
    throw new Error('日期格式无效，必须为 YYYY-MM-DD')
  }
  return `${parts[0]}-${parts[1]}`
}

/**
 * 处理单个交易项：验证日期并生成 ID。
 * @param {object} item - 原始交易项。
 * @param {Array} transactions - 当前月份的交易数组 (用于生成 ID)。
 * @returns {object} 带有 ID 的新交易项。
 */
const processTransaction = (item, transactions) => {
  validateDateField(item)
  // 更好的做法是将 generateId 移到外部，仅依赖时间戳或 UUID，避免传入整个数组。
  const newItem = {
    ...item,
    id: generateId(transactions),
    // 增加创建时间戳，便于排序和追踪
    createdAt: Date.now(),
  }
  return newItem
}

// --- 数据查找函数 ---

/**
 * 【优化】获取所有交易数据 (注意：在大数据量下会影响性能)。
 * @returns {Array} 所有交易记录的扁平数组。
 */
const getAllTransactions = () => {
  const allTransactions = []

  // 优化：使用 try-catch 处理 DATA_DIR 不存在的情况
  try {
    const files = fs
      .readdirSync(DATA_DIR)
      .filter((file) => file.endsWith('.json'))

    for (const file of files) {
      const monthKey = file.replace('.json', '')
      // 优化：如果 monthData 存在且 transactions 是数组才进行合并
      const monthData = getMonthData(monthKey)
      if (monthData && Array.isArray(monthData.transactions)) {
        allTransactions.push(...monthData.transactions)
      }
    }
  } catch (e) {
    // 如果目录不存在，返回空数组而不是崩溃
    if (e.code === 'ENOENT') {
      console.warn(`数据目录 ${DATA_DIR} 不存在，返回空数据。`)
      return []
    }
    throw e
  }

  return allTransactions
}

/**
 * 【新增】查找指定 ID 交易记录的位置信息。
 * @param {string} id - 交易记录 ID。
 * @returns {object|null} 包含 { monthKey, transactions, index } 的对象，如果未找到则返回 null。
 */
const findTransactionLocation = (id) => {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.json'))

  for (const file of files) {
    const monthKey = file.replace('.json', '')
    const monthData = getMonthData(monthKey)
    const transactions = monthData.transactions || []

    // 使用 === 比较，注意 ID 类型一致性（通常都是字符串或数字）
    const index = transactions.findIndex((t) => String(t.id) === String(id))

    if (index !== -1) {
      // 返回包含数组引用的对象，以便直接修改
      return { monthKey, transactions, index }
    }
  }
  return null
}

/**
 * 【新增】更新指定 ID 的交易记录，并写回文件。
 * ⚠️ 注意：不支持跨月更新，如果修改了 date 字段，月份必须保持不变。
 * @param {string} id - 要更新的交易记录的 ID。
 * @param {object} updatedItem - 包含更新字段的新数据。
 * @returns {object|null} 更新后的交易记录，如果未找到则返回 null。
 */
const updateTransaction = (id, updatedItem) => {
  // 1. 查找记录位置
  const location = findTransactionLocation(id)

  if (!location) {
    return null // 未找到
  }

  const { monthKey, transactions, index } = location
  const existingTransaction = transactions[index]

  // 2. 合并数据
  const newTransaction = {
    ...existingTransaction,
    ...updatedItem,
    // 确保 ID 不被覆盖
    id: existingTransaction.id,
    // 增加更新时间戳
    updatedAt: Date.now(),
  }

  // 3. 验证跨月问题
  if (updatedItem.date) {
    const newMonthKey = extractMonthKey(newTransaction.date)
    if (newMonthKey !== monthKey) {
      // 如果需要支持跨月更新，这里逻辑会复杂得多 (删除旧文件，新增新文件)
      throw new Error(
        `暂不支持跨月更新。记录当前月份为 ${monthKey}，更新后的日期月份为 ${newMonthKey}`
      )
    }
  }

  // 4. 更新内存中的交易数组
  transactions[index] = newTransaction
  // 5. 写回文件
  writeMonthData(monthKey, { transactions })

  return newTransaction
}

/**
 * 【新增】删除指定 ID 的交易记录，并写回文件。
 * @param {string} id - 要删除的交易记录的 ID。
 * @returns {object|null} 被删除的交易记录，如果未找到则返回 null。
 */
const deleteTransaction = (id) => {
  // 1. 查找记录位置
  const location = findTransactionLocation(id)
  if (!location) {
    return null // 未找到
  }
  const { monthKey, transactions, index } = location
  // 2. 从数组中删除记录
  const [deletedTransaction] = transactions.splice(index, 1)
  // 3. 写回文件
  writeMonthData(monthKey, { transactions })
  return deletedTransaction
}

// --- 统一导出 ---

module.exports = {
  validateDateField,
  extractMonthKey,
  processTransaction,
  getAllTransactions,
  findTransactionLocation, // 新增：可供其他 helper 使用
  updateTransaction, // 关键：新增的更新逻辑
  deleteTransaction, // 新增：删除逻辑
}
