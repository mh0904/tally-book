import { transactionCategoryField as defaultTransactionCategoryField } from '../constants/fields'

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

const normalizeCategory = (item, index) => {
  const value = String(item.value || item.label || '').trim()
  const label = String(item.label || item.value || '').trim()

  return {
    value: value || `category-${index + 1}`,
    label: label || value || `分类${index + 1}`,
    type: item.type === '收入' ? '收入' : '支出',
    keywords: normalizeKeywords(item.keywords),
    enabled: item.enabled !== false,
    sort: Number(item.sort || index + 1),
  }
}

export const normalizeTransactionCategoryOptions = (categories) => {
  const source = Array.isArray(categories) && categories.length
    ? categories
    : defaultTransactionCategoryField.options

  const uniqueCategories = source.reduce((acc, item, index) => {
    const normalized = normalizeCategory(item, index)
    acc.set(normalized.value, normalized)
    return acc
  }, new Map())

  return Array.from(uniqueCategories.values())
    .filter((item) => item.enabled !== false)
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
}

export const normalizeTransactionCategoryField = (categories) => {
  const options = normalizeTransactionCategoryOptions(categories)
  const defaultValue =
    options.find((item) => item.value === defaultTransactionCategoryField.defaultValue)
      ?.value ||
    options.find((item) => item.type === '支出')?.value ||
    options[0]?.value ||
    defaultTransactionCategoryField.defaultValue

  return {
    ...defaultTransactionCategoryField,
    options,
    defaultValue,
  }
}
