// server-src/utils/transactionHelper.js
const { getMonthData, writeMonthData, DATA_DIR } = require('./fileHelper')
const { generateId } = require('./idGenerator')
const fs = require('fs')

// ⚠️ 确保安装 dayjs 和 isBetween 插件
const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

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
 * 自动分类规则：根据交易描述关键词匹配分类
 */
const categoryRules = [
  { category: '餐饮', keywords: ['餐饮', '吃饭', '餐厅', '饭店', '快餐', '美食', '午餐', '晚餐', '早餐', '外卖', '食堂'] },
  { category: '购物', keywords: ['购物', '商场', '超市', '淘宝', '京东', '拼多多', '网购', '衣服', '鞋子', '化妆品', '电子产品'] },
  { category: '交通', keywords: ['交通', '地铁', '公交', '打车', '出租车', '滴滴', '共享单车', '油费', '停车费', '机票', '火车票', '汽车票', '高铁', '火车', '飞机'] },
  { category: '住房', keywords: ['房租', '水电', '燃气', '物业费', '暖气费', '维修费', '家具', '装修'] },
  { category: '工资', keywords: ['工资', '奖金', '绩效', '提成', '补贴', '收入'] },
  { category: '其他', keywords: [] } // 默认分类
]

/**
 * 根据交易描述自动匹配分类
 * @param {string} describe - 交易描述
 * @returns {string} 匹配的分类
 */
const autoClassify = (describe) => {
  if (!describe || typeof describe !== 'string') {
    return '其他' // 默认分类
  }
  
  // 转换为小写以便匹配
  const lowerDescribe = describe.toLowerCase()
  
  // 遍历分类规则，寻找匹配的关键词
  for (const rule of categoryRules) {
    if (rule.keywords.some(keyword => lowerDescribe.includes(keyword.toLowerCase()))) {
      return rule.category
    }
  }
  
  return '其他' // 默认分类
}

/**
 * 处理单个交易项：验证日期、生成 ID 和自动分类。
 * @param {object} item - 原始交易项。
 * @param {Array} transactions - 当前月份的交易数组 (用于生成 ID)。
 * @returns {object} 带有 ID 和分类的新交易项。
 */
const processTransaction = (item, transactions) => {
  validateDateField(item)
  // 保留已有ID，没有才生成新ID
  // 保留已有分类，没有则自动分类
  const newItem = {
    ...item,
    id: item.id || generateId(transactions),
    classification: item.classification || autoClassify(item.describe),
    // 保留已有创建时间，没有才生成新时间
    createdAt: item.createdAt || Date.now(),
  }
  return newItem
}

/**
 * 【核心查询函数】获取所有交易记录，支持按查询参数进行筛选，并聚合文件系统数据。
 *
 * @param {object} params - 查询参数对象。
 * @param {string} params.startDate - 开始日期 (YYYY-MM-DD)。
 * @param {string} params.endDate - 结束日期 (YYYY-MM-DD)。
 * @param {string} params.type - 交易类型。
 * @param {string} params.classification - 交易分类。
 * @param {string} params.describe - 描述关键词。
 * @returns {Array} 筛选后的交易记录数组。
 */

const getAllTransactions = (params = {}) => {
  const allTransactions = []
  const { startDate, endDate, type, classification, describe } = params

  console.log(888888, params)

  // 预先计算需要检查的月份文件，用于性能优化
  let requiredMonths = new Set()
  if (startDate && endDate) {
    let current = dayjs(startDate).startOf('month')
    const end = dayjs(endDate).startOf('month')

    // 遍历 startDate 和 endDate 之间的所有月份
    while (current.isBefore(end) || current.isSame(end)) {
      requiredMonths.add(current.format('YYYY-MM'))
      current = current.add(1, 'month')
    }
  }

  try {
    const files = fs
      .readdirSync(DATA_DIR)
      .filter((file) => file.endsWith('.json'))

    for (const file of files) {
      const monthKey = file.replace('.json', '')

      // 优化 1: 如果提供了日期范围，只读取相关月份的文件
      if (requiredMonths.size > 0 && !requiredMonths.has(monthKey)) {
        continue // 跳过不必要的月份文件读取
      }

      const monthData = getMonthData(monthKey)

      if (monthData && Array.isArray(monthData.transactions)) {
        // 筛选该月份的交易记录
        const filteredMonthTransactions = monthData.transactions.filter(
          (item) => {
            let isMatch = true

            // --- 日期范围筛选 ---
            if (startDate && endDate) {
              const itemDate = dayjs(item.date)
              const start = dayjs(startDate)
              // [) 半开区间，确保 endDate 当天包含
              isMatch =
                isMatch &&
                itemDate.isBetween(
                  start,
                  dayjs(endDate).add(1, 'day'),
                  'day',
                  '[)'
                )
            }

            // --- 交易类型筛选 ---
            if (type) {
              isMatch = isMatch && item.type === type
            }

            // --- 交易分类筛选 ---
            if (classification) {
              isMatch = isMatch && item.classification === classification
            }

            // --- 描述关键词筛选 (模糊匹配) ---
            if (describe) {
              const lowerCaseDescribe = describe.toLowerCase()
              isMatch =
                isMatch &&
                item.describe &&
                item.describe.toLowerCase().includes(lowerCaseDescribe)
            }

            return isMatch
          }
        )

        allTransactions.push(...filteredMonthTransactions)
      }
    }
  } catch (e) {
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
    // 跳过undefined.json文件，避免无效的文件读取
    if (file === 'undefined.json') {
      continue
    }
    
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

/**
 * 导出所有交易数据
 * @returns {Object} 包含所有交易数据的对象
 */
const exportAllTransactions = () => {
  const allData = {};
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.json'));

  for (const file of files) {
    const monthKey = file.replace('.json', '');
    const monthData = getMonthData(monthKey);
    allData[monthKey] = monthData;
  }

  return allData;
};

/**
 * 导入交易数据
 * @param {Object} data - 要导入的交易数据，格式与导出的相同
 * @returns {Object} 导入结果
 */
const importTransactions = (data) => {
  let importedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  try {
    console.log('导入数据接收:', JSON.stringify(data));
    // 遍历每个月份的数据
    for (const [monthKey, monthData] of Object.entries(data)) {
      console.log('处理月份:', monthKey, '数据:', JSON.stringify(monthData));
      if (monthData.transactions && Array.isArray(monthData.transactions)) {
        // 获取目标月份现有的数据
        const existingData = getMonthData(monthKey);
        const existingTransactions = existingData.transactions || [];
        
        // 处理新数据并添加到现有数据中
        for (const transaction of monthData.transactions) {
          try {
            // 验证必要字段
            if (transaction.date && transaction.amount && transaction.type) {
              // 检查是否有ID
              if (transaction.id) {
                // 有ID，检查是否存在于现有数据中
                const location = findTransactionLocation(transaction.id);
                if (location) {
                  // ID存在，更新记录
                  const updatedItem = {
                    ...transaction,
                    // 确保月份与文件月份一致
                    date: transaction.date
                  };
                  const updatedTransaction = updateTransaction(transaction.id, updatedItem);
                  if (updatedTransaction) {
                    updatedCount++;
                    // 更新内存中的现有交易列表
                    const index = existingTransactions.findIndex(t => String(t.id) === String(transaction.id));
                    if (index !== -1) {
                      existingTransactions[index] = updatedTransaction;
                    }
                  } else {
                    errorCount++;
                  }
                } else {
                  // ID不存在，新增记录
                  const processedItem = processTransaction(transaction, existingTransactions);
                  existingTransactions.push(processedItem);
                  importedCount++;
                }
              } else {
                // 没有ID，新增记录
                const processedItem = processTransaction(transaction, existingTransactions);
                existingTransactions.push(processedItem);
                importedCount++;
              }
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`导入交易失败: ${error.message}`);
          }
        }
        
        // 写入更新后的数据（新增的记录）
        writeMonthData(monthKey, { transactions: existingTransactions });
      }
    }

    return {
      success: true,
      imported: importedCount,
      updated: updatedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error(`导入数据失败: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = {
  validateDateField,
  extractMonthKey,
  processTransaction,
  getAllTransactions,
  findTransactionLocation, // 新增：可供其他 helper 使用
  updateTransaction, // 关键：新增的更新逻辑
  deleteTransaction, // 新增：删除逻辑
  exportAllTransactions, // 新增：导出所有数据
  importTransactions // 新增：导入数据
}
