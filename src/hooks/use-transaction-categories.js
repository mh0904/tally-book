import { useCallback, useMemo } from 'react'
import { transactionTypeField } from '../constants/fields'

const useTransactionCategories = (transactionCategoryField, activeType) => {
  const categoryOptions = useMemo(
    () =>
      Array.isArray(transactionCategoryField?.options)
        ? transactionCategoryField.options
        : [],
    [transactionCategoryField]
  )

  const getCategoryOptionsByType = useCallback(
    (type) => {
      if (!type) {
        return categoryOptions
      }

      const groupedOptions = transactionCategoryField?.optionsByType?.[type]

      return Array.isArray(groupedOptions)
        ? groupedOptions
        : categoryOptions.filter((item) => !item.type || item.type === type)
    },
    [categoryOptions, transactionCategoryField]
  )

  const getDefaultCategoryValue = useCallback(
    (type = transactionTypeField.defaultValue) => {
      const typeCategoryOptions = getCategoryOptionsByType(type)
      const typeDefaultValue = transactionCategoryField?.defaultValues?.[type]
      const fieldDefaultCategory = typeCategoryOptions.find(
        (item) => item.value === typeDefaultValue
      )

      return (
        fieldDefaultCategory?.value ||
        typeCategoryOptions.find((item) => item.isDefault)?.value ||
        typeCategoryOptions[0]?.value ||
        ''
      )
    },
    [getCategoryOptionsByType, transactionCategoryField]
  )

  const getCategoryLabel = useCallback(
    (value) =>
      categoryOptions.find((item) => item.value === value)?.label ||
      value ||
      '未分类',
    [categoryOptions]
  )

  const activeCategoryOptions = useMemo(
    () => getCategoryOptionsByType(activeType),
    [activeType, getCategoryOptionsByType]
  )

  return {
    activeCategoryOptions,
    categoryOptions,
    getCategoryLabel,
    getCategoryOptionsByType,
    getDefaultCategoryValue,
  }
}

export default useTransactionCategories
