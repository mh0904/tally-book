import React from 'react'
import { Form, message } from 'antd'
import { resetTransactionCategories } from '../../api/transaction-categories'
import { normalizeAllTransactionCategories } from '../../config/transaction-categories'
import useMediaQuery from '../../hooks/use-media-query'
import CategoryEditorModal from './category-editor-modal'
import CategoryFilter from './category-filter'
import CategoryHeader from './category-header'
import CategoryMobileList from './category-mobile-list'
import CategoryTable from './category-table'
import {
  CATEGORY_TYPES,
  createCategoryValue,
  ensureDefaultCategory,
  formatKeywords,
  getNextSort,
  splitKeywords,
} from './category-utils'
import './index.less'

const MOBILE_LIST_QUERY = '(max-width: 56.25em)'

const CategoryConfig = ({
  categories = [],
  onCategoriesChange,
  onCategoriesRefresh,
}) => {
  const [form] = Form.useForm()
  const [activeType, setActiveType] = React.useState(CATEGORY_TYPES[0])
  const [showHidden, setShowHidden] = React.useState(false)
  const [editingValue, setEditingValue] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const isMobileList = useMediaQuery(MOBILE_LIST_QUERY)

  const normalizedCategories = React.useMemo(
    () => normalizeAllTransactionCategories(categories),
    [categories]
  )
  const visibleCategories = React.useMemo(
    () =>
      normalizedCategories.filter(
        (item) =>
          item.type === activeType && (showHidden || item.enabled !== false)
      ),
    [activeType, normalizedCategories, showHidden]
  )
  const editingCategory = React.useMemo(
    () => normalizedCategories.find((item) => item.value === editingValue),
    [editingValue, normalizedCategories]
  )

  const persistCategories = async (nextCategories, successMsg) => {
    setSaving(true)

    try {
      const savedCategories = await onCategoriesChange(
        normalizeAllTransactionCategories(nextCategories)
      )
      message.success(successMsg)
      return savedCategories
    } catch (error) {
      message.error(error.message || '分类保存失败')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = () => {
    setEditingValue(null)
    form.setFieldsValue({
      enabled: true,
      isDefault: false,
      keywords: '',
      label: '',
      sort: getNextSort(normalizedCategories, activeType),
      type: activeType,
      value: '',
    })
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingValue(record.value)
    form.setFieldsValue({
      ...record,
      keywords: formatKeywords(record.keywords),
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const nextValue = createCategoryValue(values.value || values.label, values.type)
    const duplicate = normalizedCategories.some(
      (item) => item.value === nextValue && item.value !== editingValue
    )

    if (duplicate) {
      message.warning('分类标识已存在')
      return
    }

    const nextCategory = {
      ...editingCategory,
      enabled: values.enabled !== false,
      isDefault: values.isDefault === true,
      keywords: splitKeywords(values.keywords),
      label: values.label.trim(),
      sort: values.sort,
      type: values.type,
      value: nextValue,
    }
    const withCurrentCategory = editingValue
      ? normalizedCategories.map((item) =>
          item.value === editingValue ? nextCategory : item
        )
      : [...normalizedCategories, nextCategory]
    const clearedDefaults = nextCategory.isDefault
      ? withCurrentCategory.map((item) =>
          item.type === nextCategory.type && item.value !== nextCategory.value
            ? { ...item, isDefault: false }
            : item
        )
      : withCurrentCategory
    const nextCategories = ensureDefaultCategory(clearedDefaults, nextCategory.type)
    const savedCategories = await persistCategories(nextCategories, '分类已保存')

    if (savedCategories) {
      setModalOpen(false)
      setEditingValue(null)
      setActiveType(nextCategory.type)
    }
  }

  const handleDelete = async (record) => {
    const nextCategories = ensureDefaultCategory(
      normalizedCategories.filter((item) => item.value !== record.value),
      record.type
    )

    await persistCategories(nextCategories, '分类已删除')
  }

  const handleStatusChange = async (record, enabled) => {
    const nextCategories = ensureDefaultCategory(
      normalizedCategories.map((item) =>
        item.value === record.value
          ? {
              ...item,
              enabled,
              isDefault: enabled ? item.isDefault : false,
            }
          : item
      ),
      record.type
    )

    await persistCategories(nextCategories, enabled ? '分类已启用' : '分类已停用')
  }

  const handleDefaultChange = async (record, checked) => {
    const nextCategories = normalizedCategories.map((item) => {
      if (item.type !== record.type) {
        return item
      }

      if (item.value === record.value) {
        return { ...item, isDefault: checked }
      }

      return checked ? { ...item, isDefault: false } : item
    })

    await persistCategories(
      ensureDefaultCategory(nextCategories, record.type),
      checked ? '已设为默认' : '默认分类已更新'
    )
  }

  const handleReset = async () => {
    setSaving(true)

    try {
      const { code, msg } = await resetTransactionCategories()

      if (code !== 200) {
        throw new Error(msg || '恢复默认分类失败')
      }

      await onCategoriesRefresh()
      message.success('已恢复默认分类')
    } catch (error) {
      message.error(error.message || '恢复默认分类失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="category-config-page">
      <section className="category-config-panel page-panel">
        <CategoryHeader
          onAdd={handleAdd}
          onReset={handleReset}
          saving={saving}
        />

        <CategoryFilter
          activeType={activeType}
          onShowHiddenChange={setShowHidden}
          onTypeChange={setActiveType}
          showHidden={showHidden}
        />

        {isMobileList ? (
          <CategoryMobileList
            activeType={activeType}
            categories={visibleCategories}
            onDefaultChange={handleDefaultChange}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            saving={saving}
          />
        ) : (
          <CategoryTable
            categories={visibleCategories}
            onDefaultChange={handleDefaultChange}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            saving={saving}
          />
        )}
      </section>

      <CategoryEditorModal
        editingValue={editingValue}
        form={form}
        onCancel={() => setModalOpen(false)}
        onSave={handleSave}
        open={modalOpen}
        saving={saving}
      />
    </div>
  )
}

export default CategoryConfig
