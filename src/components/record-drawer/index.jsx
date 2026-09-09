import React from 'react'
import dayjs from 'dayjs'
import { Drawer, Form, message } from 'antd'
import { addTransactions, batchAddTransactions } from '../../api/transactions'
import { transactionTypeField } from '../../constants/fields'
import useTransactionCategories from '../../hooks/use-transaction-categories'
import {
  createBatchTransactions,
  createSingleTransaction,
} from '../../utils/transaction-batch'
import RecordFooter from './record-footer'
import RecordForm from './record-form'
import RecordHeader from './record-header'
import { ACCOUNT_OPTIONS, MEMBER_OPTIONS } from './record-options'
import './index.less'

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
    ? 'min(92rem, calc(100vw - 7.2rem))'
    : 'min(92rem, calc(100vw - 23.2rem))'
  const transactionType = Form.useWatch('type', form)
  const {
    activeCategoryOptions: formCategoryOptions,
    getCategoryLabel,
    getDefaultCategoryValue,
  } = useTransactionCategories(transactionCategoryField, transactionType)

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
        const payload = createSingleTransaction(
          values,
          getCategoryLabel(values.classification),
        )
        const { code, msg } = await addTransactions(payload)

        if (code !== 200) {
          throw new Error(msg || '保存失败')
        }
      } else {
        const nextItems = createBatchTransactions(values, values.mode || batchMode)

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
            <RecordHeader
              entryMode={entryMode}
              onClose={onClose}
              onEntryModeChange={handleEntryModeChange}
              onImport={onImport}
            />
            <RecordForm
              batchMode={batchMode}
              categoryOptions={formCategoryOptions}
              entryMode={entryMode}
              form={form}
              onBatchModeChange={handleBatchModeChange}
              onTypeChange={(nextType) => {
                form.setFieldsValue({ type: nextType })
                handleTypeChange(nextType)
              }}
              transactionType={transactionType}
              transactionTypeOptions={transactionTypeField.options}
            />
            <RecordFooter
              onSave={() => handleSave(false)}
              onSaveAgain={() => handleSave(true)}
              saving={saving}
            />
          </section>
        </div>
      </Drawer>
    </>
  )
}

export default RecordDrawer
