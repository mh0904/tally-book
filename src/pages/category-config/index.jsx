import React from 'react'
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import { resetTransactionCategories } from '../../api/transaction-categories'
import { normalizeAllTransactionCategories } from '../../config/transaction-categories'
import './index.less'

const CATEGORY_TYPES = ['支出', '收入']
const MOBILE_LIST_QUERY = '(max-width: 900px)'

const getIsMobileList = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_LIST_QUERY).matches

const useMobileList = () => {
  const [isMobileList, setIsMobileList] = React.useState(getIsMobileList)

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const matcher = window.matchMedia(MOBILE_LIST_QUERY)
    const handleChange = (event) => {
      setIsMobileList(event.matches)
    }

    setIsMobileList(matcher.matches)
    matcher.addEventListener('change', handleChange)

    return () => {
      matcher.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobileList
}

const splitKeywords = (value) =>
  String(value || '')
    .split(/[,，、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const formatKeywords = (keywords) =>
  Array.isArray(keywords) ? keywords.join('，') : ''

const createCategoryValue = (label, fallbackType) => {
  const source = String(label || '').trim()

  if (source) {
    return source
  }

  return `${fallbackType}-${Date.now()}`
}

const getNextSort = (categories, type) => {
  const sameTypeCategories = categories.filter((item) => item.type === type)
  const maxSort = sameTypeCategories.reduce(
    (max, item) => Math.max(max, Number(item.sort || 0)),
    type === '收入' ? 0 : 100
  )

  return maxSort + 1
}

const ensureDefaultCategory = (categories, type) => {
  const sameTypeCategories = categories.filter(
    (item) => item.type === type && item.enabled !== false
  )

  if (!sameTypeCategories.length || sameTypeCategories.some((item) => item.isDefault)) {
    return categories
  }

  const fallbackValue = sameTypeCategories[0].value

  return categories.map((item) =>
    item.value === fallbackValue ? { ...item, isDefault: true } : item
  )
}

const CategoryConfig = ({
  categories = [],
  onCategoriesChange,
  onCategoriesRefresh,
}) => {
  const [form] = Form.useForm()
  const [activeType, setActiveType] = React.useState('支出')
  const [showHidden, setShowHidden] = React.useState(false)
  const [editingValue, setEditingValue] = React.useState(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const isMobileList = useMobileList()

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

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'label',
      render: (value, record) => (
        <div className="category-name-cell">
          <span className="category-icon">
            {String(value || record.value).slice(0, 1)}
          </span>
          <div>
            <strong>{value}</strong>
            <span>{record.value}</span>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (value) => <Tag color={value === '收入' ? 'success' : 'orange'}>{value}</Tag>,
    },
    {
      title: '关键词',
      dataIndex: 'keywords',
      render: (keywords = []) => (
        <Space size={[4, 4]} wrap>
          {keywords.length ? (
            keywords.slice(0, 4).map((keyword) => (
              <Tag className="keyword-tag" key={keyword}>
                {keyword}
              </Tag>
            ))
          ) : (
            <span className="category-muted">无</span>
          )}
          {keywords.length > 4 && (
            <Tag className="keyword-tag">+{keywords.length - 4}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      width: 90,
      render: (value, record) => (
        <Switch
          checked={value}
          disabled={record.enabled === false || saving}
          onChange={(checked) => handleDefaultChange(record, checked)}
          size="small"
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 100,
      render: (value, record) => (
        <Switch
          checked={value !== false}
          checkedChildren="启用"
          disabled={saving}
          onChange={(checked) => handleStatusChange(record, checked)}
          size="small"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size={8}>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            type="text"
          >
            编辑
          </Button>
          <Popconfirm
            cancelText="取消"
            okButtonProps={{ danger: true }}
            okText="删除"
            onConfirm={() => handleDelete(record)}
            title="确认删除该分类？"
          >
            <Button danger icon={<DeleteOutlined />} size="small" type="text">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="category-config-page">
      <section className="category-config-panel page-panel">
        <div className="category-config-header">
          <div>
            <h2>收支分类管理</h2>
            <span>维护分类、关键词、默认项和启用状态</span>
          </div>
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleAdd} type="primary">
              新增
            </Button>
          </Space>
        </div>

        <div className="category-config-filter">
          <Radio.Group
            buttonStyle="solid"
            onChange={(event) => setActiveType(event.target.value)}
            optionType="button"
            options={CATEGORY_TYPES.map((type) => ({
              label: `${type}类型`,
              value: type,
            }))}
            value={activeType}
          />
          <Checkbox
            checked={showHidden}
            onChange={(event) => setShowHidden(event.target.checked)}
          >
            显示已隐藏的分类
          </Checkbox>
        </div>

        {isMobileList ? (
          <section className="category-mobile-list" aria-label="分类滚动列表">
            <div className="category-mobile-summary">
              <span>{activeType}分类</span>
              <strong>{visibleCategories.length} 项</strong>
            </div>

            {visibleCategories.length ? (
              <div className="category-mobile-scroll">
                {visibleCategories.map((record) => (
                  <article
                    className={[
                      'category-mobile-item',
                      record.enabled === false ? 'is-hidden' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    key={record.value}
                  >
                    <span className="category-icon">
                      {String(record.label || record.value).slice(0, 1)}
                    </span>
                    <div className="category-mobile-main">
                      <div className="category-mobile-title">
                        <strong>{record.label}</strong>
                        <Tag color={record.type === '收入' ? 'success' : 'orange'}>
                          {record.type}
                        </Tag>
                      </div>
                      <div className="category-mobile-meta">
                        <span>{record.value}</span>
                        <span>排序 {record.sort}</span>
                      </div>
                      <div className="category-mobile-keywords">
                        {record.keywords?.length
                          ? record.keywords.slice(0, 4).join('、')
                          : '无关键词'}
                      </div>
                    </div>
                    <div className="category-mobile-side">
                      <Switch
                        checked={record.enabled !== false}
                        checkedChildren="启用"
                        disabled={saving}
                        onChange={(checked) => handleStatusChange(record, checked)}
                        size="small"
                        unCheckedChildren="停用"
                      />
                      <Switch
                        checked={record.isDefault}
                        checkedChildren="默认"
                        disabled={record.enabled === false || saving}
                        onChange={(checked) => handleDefaultChange(record, checked)}
                        size="small"
                        unCheckedChildren="默认"
                      />
                    </div>
                    <div className="category-mobile-actions">
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                        type="text"
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                        okText="删除"
                        onConfirm={() => handleDelete(record)}
                        title="确认删除该分类？"
                      >
                        <Button danger icon={<DeleteOutlined />} size="small" type="text">
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <Empty className="category-mobile-empty" description="暂无分类" />
            )}
          </section>
        ) : (
          <Table
            className="category-config-table"
            columns={columns}
            dataSource={visibleCategories}
            pagination={false}
            rowClassName={(record) => (record.enabled === false ? 'is-hidden' : '')}
            rowKey="value"
            scroll={{ x: 860, y: 520 }}
          />
        )}
      </section>

      <Modal
        cancelText="取消"
        confirmLoading={saving}
        okText="保存"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        open={modalOpen}
        title={editingValue ? '编辑分类' : '新增分类'}
        width={560}
      >
        <Form
          className="category-edit-form"
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <div className="category-form-row">
            <Form.Item
              label="分类名称"
              name="label"
              rules={[{ required: true, message: '请输入分类名称' }]}
            >
              <Input maxLength={20} placeholder="例如 餐饮" prefix={<TagsOutlined />} />
            </Form.Item>
            <Form.Item
              label="分类标识"
              name="value"
              tooltip="新增时可留空，默认使用分类名称"
            >
              <Input disabled={Boolean(editingValue)} maxLength={30} placeholder="可留空" />
            </Form.Item>
          </div>

          <div className="category-form-row">
            <Form.Item
              label="类型"
              name="type"
              rules={[{ required: true, message: '请选择分类类型' }]}
            >
              <Radio.Group
                disabled={Boolean(editingValue)}
                options={CATEGORY_TYPES.map((type) => ({ label: type, value: type }))}
              />
            </Form.Item>
            <Form.Item
              label="排序"
              name="sort"
              rules={[{ required: true, message: '请输入排序值' }]}
            >
              <InputNumber min={1} precision={0} />
            </Form.Item>
          </div>

          <Form.Item label="关键词" name="keywords">
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              placeholder="用逗号分隔，例如 午餐，奶茶，咖啡"
            />
          </Form.Item>

          <div className="category-form-row small">
            <Form.Item label="状态" name="enabled" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
            <Form.Item label="默认分类" name="isDefault" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryConfig
