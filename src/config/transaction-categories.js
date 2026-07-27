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
    isDefault: item.isDefault === true || item.default === true,
    sort: Number(item.sort || index + 1),
  }
}

export const normalizeTransactionCategoryOptions = (categories) => {
  const source = Array.isArray(categories) ? categories : []

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
  const optionsByType = options.reduce((acc, item) => {
    const type = item.type || '支出'

    if (!acc[type]) {
      acc[type] = []
    }

    acc[type].push(item)
    return acc
  }, {})
  const defaultValues = Object.entries(optionsByType).reduce(
    (acc, [type, typeOptions]) => {
      acc[type] =
        typeOptions.find((item) => item.isDefault)?.value ||
        typeOptions[0]?.value ||
        ''
      return acc
    },
    {}
  )
  const defaultValue =
    defaultValues['支出'] || options[0]?.value || ''

  return {
    key: 'category',
    label: '交易分类',
    description: '交易的具体分类，便于统计',
    options,
    optionsByType,
    defaultValues,
    defaultValue,
  }
}
