import React from 'react'
import dayjs from 'dayjs'
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from 'antd'
import { CloseOutlined, UploadOutlined } from '@ant-design/icons'
import { addTransactions, batchAddTransactions } from '../../api/transactions'
import { transactionTypeField } from '../../constants/fields'
import './index.less'

const DATE_FORMAT = 'YYYY-MM-DD'

const ACCOUNT_OPTIONS = [
  { label: '最近使用 / 现金(CNY)', value: 'cash' },
  { label: '微信钱包', value: 'wechat' },
  { label: '银行卡', value: 'bank-card' },
]

const MEMBER_OPTIONS = [
  { label: '最近使用 / 130****9881', value: 'admin' },
  { label: '家庭成员', value: 'family' },
]

const MERCHANT_OPTIONS = [
  { label: '请选择', value: '' },
  { label: '超市', value: 'market' },
  { label: '外卖平台', value: 'delivery' },
]

const PROJECT_OPTIONS = [
  { label: '请选择', value: '' },
  { label: '日常生活', value: 'daily' },
  { label: '家庭固定支出', value: 'family-cost' },
]

const ENTRY_TABS = [
  { key: 'single', label: '单笔' },
  { key: 'batch', label: '多笔' },
]

const BATCH_MODE_OPTIONS = [
  { label: '按日期批量', value: 'severalDaysBatch' },
  { label: '同一天批量', value: 'oddDaysBatch' },
]

const parseAmountItems = (text = '') => {
  const regex = /([^0-9.元]+?)(\d+\.?\d*)元/g
  const items = []
  let match

  while ((match = regex.exec(text)) !== null) {
    const describe = match[1].replace(/[，。、,]/g, '').trim()
    const amount = Number(match[2])

    if (describe && Number.isFinite(amount)) {
      items.push({ amount, describe })
    }
  }

  return items
}

const formatDateText = (dateText, year) => {
  const monthMatch = String(dateText || '').match(/(\d+)月/)
  const dayMatch = String(dateText || '').match(/(\d+)号/)

  if (!monthMatch || !dayMatch) {
    return ''
  }

  const month = monthMatch[1].padStart(2, '0')
  const day = dayMatch[1].padStart(2, '0')

  return `${year}-${month}-${day}`
}

const createBatchItems = (values, batchMode) => {
  const commonFields = {
    account: values.account,
    member: values.member,
    merchant: values.merchant,
    project: values.project,
  }

  if (batchMode === 'oddDaysBatch') {
    const date = dayjs(values.date).format(DATE_FORMAT)

    return parseAmountItems(values.oddDaysBatchDescribe).map((item) => ({
      ...item,
      ...commonFields,
      date,
      type: values.type,
    }))
  }

  const year = dayjs(values.year).format('YYYY')
  const dateGroupRegex = /(\d+月\d+号)([\s\S]*?)(?=\d+月\d+号|$)/g
  const params = []
  let dateGroupMatch

  while (
    (dateGroupMatch = dateGroupRegex.exec(values.severalDaysBatchDescribe)) !==
    null
  ) {
    const date = formatDateText(dateGroupMatch[1], year)

    if (!date) {
      continue
    }

    parseAmountItems(dateGroupMatch[2]).forEach((item) => {
      params.push({
        ...item,
        ...commonFields,
        date,
        type: values.type,
      })
    })
  }

  return params
}

const cleanSinglePayload = (values, fallbackDescribe) => {
  const {
    mode,
    oddDaysBatchDescribe,
    severalDaysBatchDescribe,
    year,
    ...payload
  } = values

  return {
    ...payload,
    date: dayjs(values.date).format(DATE_FORMAT),
    describe: payload.describe || fallbackDescribe,
  }
}

const RecordDrawer = ({
  open,
  onClose,
  onImport,
  onSaved,
  sidebarCollapsed = false,
  transactionCategoryField,
}) => {
  const [form] = Form.useForm()
  const [entryMode, setEntryMode] = React.useState('single')
  const [batchMode, setBatchMode] = React.useState('severalDaysBatch')
  const [saving, setSaving] = React.useState(false)
  const wasOpenRef = React.useRef(false)
  const drawerWidth = sidebarCollapsed
    ? 'min(920px, calc(100vw - 72px))'
    : 'min(920px, calc(100vw - 232px))'
  const transactionType = Form.useWatch('type', form)
  const categoryOptions = React.useMemo(
    () =>
      Array.isArray(transactionCategoryField?.options)
        ? transactionCategoryField.options
        : [],
    [transactionCategoryField],
  )
  const getCategoryOptionsByType = React.useCallback(
    (type) => {
      if (!type) {
        return categoryOptions
      }

      const groupedOptions = transactionCategoryField?.optionsByType?.[type]

      return Array.isArray(groupedOptions)
        ? groupedOptions
        : categoryOptions.filter((item) => !item.type || item.type === type)
    },
    [categoryOptions, transactionCategoryField],
  )
  const getDefaultCategoryValue = React.useCallback(
    (type = transactionTypeField.defaultValue) => {
      const typeCategoryOptions = getCategoryOptionsByType(type)
      const typeDefaultValue = transactionCategoryField?.defaultValues?.[type]
      const fieldDefaultCategory = typeCategoryOptions.find(
        (item) => item.value === typeDefaultValue,
      )

      return (
        fieldDefaultCategory?.value ||
        typeCategoryOptions.find((item) => item.isDefault)?.value ||
        typeCategoryOptions[0]?.value ||
        ''
      )
    },
    [getCategoryOptionsByType, transactionCategoryField],
  )
  const formCategoryOptions = getCategoryOptionsByType(transactionType)
  const getCategoryLabel = (value) =>
    categoryOptions.find((item) => item.value === value)?.label ||
    value ||
    '未分类'

  const resetForm = React.useCallback(
    (nextEntryMode = 'single', nextBatchMode = 'severalDaysBatch') => {
      const type = transactionTypeField.defaultValue
      const mode = nextEntryMode === 'single' ? 'single' : nextBatchMode

      form.resetFields()
      form.setFieldsValue({
        account: ACCOUNT_OPTIONS[0].value,
        classification: getDefaultCategoryValue(type),
        date: dayjs(),
        member: MEMBER_OPTIONS[0].value,
        mode,
        project: '',
        merchant: '',
        type,
        year: dayjs(),
      })
    },
    [form, getDefaultCategoryValue],
  )

  React.useEffect(() => {
    if (!open) {
      wasOpenRef.current = false
      return
    }

    if (wasOpenRef.current) {
      return
    }

    wasOpenRef.current = true
    setEntryMode('single')
    setBatchMode('severalDaysBatch')
    resetForm('single', 'severalDaysBatch')
  }, [open, resetForm])

  const handleEntryModeChange = (nextEntryMode) => {
    const currentType =
      form.getFieldValue('type') || transactionTypeField.defaultValue

    setEntryMode(nextEntryMode)
    form.setFieldsValue({
      classification: getDefaultCategoryValue(currentType),
      date: form.getFieldValue('date') || dayjs(),
      mode: nextEntryMode === 'single' ? 'single' : batchMode,
      type: currentType,
      year: form.getFieldValue('year') || dayjs(),
    })
  }

  const handleBatchModeChange = (nextBatchMode) => {
    setBatchMode(nextBatchMode)
    form.setFieldsValue({ mode: nextBatchMode })
  }

  const handleTypeChange = (nextType) => {
    form.setFieldsValue({
      classification: getDefaultCategoryValue(nextType),
    })
  }

  const handleSave = async (keepOpen = false) => {
    setSaving(true)

    try {
      const values = await form.validateFields()

      if (entryMode === 'single') {
        const payload = cleanSinglePayload(
          values,
          getCategoryLabel(values.classification),
        )
        const { code, msg } = await addTransactions(payload)

        if (code !== 200) {
          throw new Error(msg || '保存失败')
        }
      } else {
        const nextItems = createBatchItems(values, values.mode || batchMode)

        if (!nextItems.length) {
          message.warning('没有识别到可保存的账单')
          return
        }

        const { code, msg } = await batchAddTransactions(nextItems)

        if (code !== 200) {
          throw new Error(msg || '批量保存失败')
        }
      }

      message.success('已保存')

      if (onSaved) {
        await onSaved()
      }

      if (keepOpen) {
        resetForm(entryMode, batchMode)
      } else {
        onClose?.()
      }
    } catch (error) {
      if (!error?.errorFields) {
        message.error(error?.message || '保存失败')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Drawer
        className="record-drawer"
        closable={false}
        footer={null}
        mask={false}
        onClose={onClose}
        open={open}
        placement="left"
        rootClassName={[
          'record-drawer-root',
          sidebarCollapsed ? 'sidebar-collapsed' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        width={drawerWidth}
        zIndex={20}
      >
        <div className="record-drawer-layout">
          <section className="record-panel">
            <header className="record-header">
              <div className="record-entry-tabs">
                {ENTRY_TABS.map((item) => (
                  <button
                    className={entryMode === item.key ? 'active' : ''}
                    key={item.key}
                    onClick={() => handleEntryModeChange(item.key)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Space>
                <Button
                  className="record-import-trigger"
                  icon={<UploadOutlined />}
                  onClick={onImport}
                  type="default"
                >
                  导入
                </Button>
                <Button
                  aria-label="关闭"
                  className="record-close"
                  icon={<CloseOutlined />}
                  onClick={onClose}
                  type="text"
                />
              </Space>
            </header>

            <Form
              className="record-form"
              form={form}
              layout="vertical"
              requiredMark="optional"
            >
              <Form.Item name="mode" noStyle>
                <Input type="hidden" />
              </Form.Item>

              <div className="record-type-tabs">
                {transactionTypeField.options.map((item) => (
                  <button
                    className={transactionType === item.value ? 'active' : ''}
                    key={item.value}
                    onClick={() => {
                      form.setFieldsValue({ type: item.value })
                      handleTypeChange(item.value)
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Form.Item name="type" noStyle>
                <Input type="hidden" />
              </Form.Item>

              {entryMode === 'batch' && (
                <div className="record-batch-tabs">
                  {BATCH_MODE_OPTIONS.map((item) => (
                    <button
                      className={batchMode === item.value ? 'active' : ''}
                      key={item.value}
                      onClick={() => handleBatchModeChange(item.value)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {entryMode === 'single' ? (
                <>
                  <Form.Item
                    label="金额"
                    name="amount"
                    rules={[
                      { required: true, message: '请输入金额' },
                      { type: 'number', min: 0.01, message: '金额需大于 0' },
                    ]}
                  >
                    <InputNumber
                      className="record-amount-input"
                      controls={false}
                      min={0}
                      placeholder="请输入金额"
                      precision={2}
                      prefix="¥"
                    />
                  </Form.Item>

                  <Form.Item
                    label="分类"
                    name="classification"
                    rules={[{ required: true, message: '请选择分类' }]}
                  >
                    <Select
                      disabled={!formCategoryOptions.length}
                      options={formCategoryOptions}
                      placeholder="请选择分类"
                    />
                  </Form.Item>
                </>
              ) : (
                <>
                  {batchMode === 'oddDaysBatch' && (
                    <Form.Item
                      label="记账日期"
                      name="date"
                      rules={[{ required: true, message: '请选择日期' }]}
                    >
                      <DatePicker format={DATE_FORMAT} />
                    </Form.Item>
                  )}

                  {batchMode === 'severalDaysBatch' && (
                    <Form.Item
                      label="年份"
                      name="year"
                      rules={[{ required: true, message: '请选择年份' }]}
                    >
                      <DatePicker picker="year" />
                    </Form.Item>
                  )}

                  <Form.Item
                    label="批量内容"
                    name={
                      batchMode === 'oddDaysBatch'
                        ? 'oddDaysBatchDescribe'
                        : 'severalDaysBatchDescribe'
                    }
                    rules={[{ required: true, message: '请输入批量内容' }]}
                  >
                    <Input.TextArea
                      autoSize={{ minRows: 8, maxRows: 12 }}
                      placeholder={
                        batchMode === 'oddDaysBatch'
                          ? '例如：早餐12元，水果18.5元'
                          : '例如：8月1号早餐12元，8月2号水果18.5元'
                      }
                    />
                  </Form.Item>
                </>
              )}

              {entryMode === 'single' && (
                <Form.Item
                  label="记账时间"
                  name="date"
                  rules={[{ required: true, message: '请选择日期' }]}
                >
                  <DatePicker format={DATE_FORMAT} />
                </Form.Item>
              )}

              <div className="record-field-grid">
                <Form.Item label="账户" name="account">
                  <Select options={ACCOUNT_OPTIONS} />
                </Form.Item>
                <Form.Item label="成员" name="member">
                  <Select options={MEMBER_OPTIONS} />
                </Form.Item>
                <Form.Item label="商家" name="merchant">
                  <Select options={MERCHANT_OPTIONS} />
                </Form.Item>
                <Form.Item label="项目" name="project">
                  <Select options={PROJECT_OPTIONS} />
                </Form.Item>
              </div>

              {entryMode === 'single' && (
                <Form.Item label="备注" name="describe">
                  <Input.TextArea
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    placeholder="补充备注"
                  />
                </Form.Item>
              )}
            </Form>

            <footer className="record-footer">
              <Button
                loading={saving}
                onClick={() => handleSave(false)}
                type="primary"
              >
                保存
              </Button>
              <Button loading={saving} onClick={() => handleSave(true)}>
                保存并再记
              </Button>
            </footer>
          </section>
        </div>
      </Drawer>
    </>
  )
}

export default RecordDrawer
