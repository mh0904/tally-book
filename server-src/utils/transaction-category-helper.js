const fs = require('fs')
const path = require('path')

const CATEGORY_DATA_DIR = path.join(__dirname, '../category-files')
const CATEGORY_FILE = path.join(
  CATEGORY_DATA_DIR,
  'transaction-category-config.json'
)
const DEFAULT_CATEGORY_FILE = path.join(
  CATEGORY_DATA_DIR,
  'default-transaction-category-config.json'
)

const sortCategories = (categories = []) =>
  categories.sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

const normalizeKeywords = (keywords) => {
  if (!Array.isArray(keywords)) {
    return []
  }

  return Array.from(
    new Set(
      keywords
        .map((keyword) => String(keyword || '').trim())
        .filter(Boolean)
    )
  )
}

const normalizeCategory = (item, fallbackIndex) => {
  const value = String(item.value || item.label || '').trim()
  const label = String(item.label || item.value || '').trim()

  return {
    value: value || `category-${fallbackIndex + 1}`,
    label: label || value || `分类${fallbackIndex + 1}`,
    type: item.type === '收入' ? '收入' : '支出',
    keywords: normalizeKeywords(item.keywords),
    enabled: item.enabled !== false,
    isDefault: item.isDefault === true || item.default === true,
    sort: Number(item.sort || fallbackIndex + 1),
  }
}

const normalizeTransactionCategoryConfig = (categories) => {
  if (!Array.isArray(categories)) {
    return getDefaultTransactionCategoryConfig()
  }

  const uniqueCategories = categories.reduce((acc, item, index) => {
    const normalized = normalizeCategory(item, index)
    acc.set(normalized.value, normalized)
    return acc
  }, new Map())

  return sortCategories(Array.from(uniqueCategories.values()))
}

const readCategoryJson = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

const ensureCategoryDir = () => {
  if (!fs.existsSync(CATEGORY_DATA_DIR)) {
    fs.mkdirSync(CATEGORY_DATA_DIR, { recursive: true })
  }
}

const getDefaultTransactionCategoryConfig = () => {
  return normalizeTransactionCategoryConfig(readCategoryJson(DEFAULT_CATEGORY_FILE))
}

const ensureTransactionCategoryFile = () => {
  ensureCategoryDir()

  if (!fs.existsSync(CATEGORY_FILE)) {
    fs.writeFileSync(
      CATEGORY_FILE,
      JSON.stringify(getDefaultTransactionCategoryConfig(), null, 2),
      'utf8'
    )
  }
}

const getTransactionCategoryConfig = () => {
  ensureTransactionCategoryFile()
  return normalizeTransactionCategoryConfig(readCategoryJson(CATEGORY_FILE))
}

const writeTransactionCategoryConfig = (categories) => {
  ensureCategoryDir()
  const normalizedCategories = normalizeTransactionCategoryConfig(categories)
  fs.writeFileSync(
    CATEGORY_FILE,
    JSON.stringify(normalizedCategories, null, 2),
    'utf8'
  )
  return normalizedCategories
}

const resetTransactionCategoryConfig = () => {
  return writeTransactionCategoryConfig(getDefaultTransactionCategoryConfig())
}

module.exports = {
  getDefaultTransactionCategoryConfig,
  getTransactionCategoryConfig,
  resetTransactionCategoryConfig,
  writeTransactionCategoryConfig,
}
