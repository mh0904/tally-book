// server-src/utils/fileHelper.js
const fs = require('fs')
const path = require('path')

// 数据存储根目录（month-files）
const DATA_DIR = path.join(__dirname, '../month-files')

// 确保目录存在
const ensureDirExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// 获取指定月份的数据文件内容
const getMonthData = (monthKey) => {
  ensureDirExists()
  const filePath = path.join(DATA_DIR, `${monthKey}.json`)
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data) || { transactions: [] }
  }
  return { transactions: [] }
}

// 写入数据到指定月份文件
const writeMonthData = (monthKey, data) => {
  ensureDirExists()
  const filePath = path.join(DATA_DIR, `${monthKey}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

module.exports = { getMonthData, writeMonthData, DATA_DIR }
