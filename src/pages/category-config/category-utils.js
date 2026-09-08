export const CATEGORY_TYPES = ['支出', '收入']

export const splitKeywords = (value) =>
  String(value || '')
    .split(/[,，、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)

export const formatKeywords = (keywords) =>
  Array.isArray(keywords) ? keywords.join('，') : ''

export const createCategoryValue = (label, fallbackType) => {
  const source = String(label || '').trim()

  if (source) {
    return source
  }

  return `${fallbackType}-${Date.now()}`
}

export const getNextSort = (categories, type) => {
  const sameTypeCategories = categories.filter((item) => item.type === type)
  const maxSort = sameTypeCategories.reduce(
    (max, item) => Math.max(max, Number(item.sort || 0)),
    type === '收入' ? 0 : 100
  )

  return maxSort + 1
}

export const ensureDefaultCategory = (categories, type) => {
  const sameTypeCategories = categories.filter(
    (item) => item.type === type && item.enabled !== false
  )

  if (
    !sameTypeCategories.length ||
    sameTypeCategories.some((item) => item.isDefault)
  ) {
    return categories
  }

  const fallbackValue = sameTypeCategories[0].value

  return categories.map((item) =>
    item.value === fallbackValue ? { ...item, isDefault: true } : item
  )
}
