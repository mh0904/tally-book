import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import {
  Table,
  Space,
  Button,
  Form,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Radio,
  Modal,
} from 'antd'
const { RangePicker } = DatePicker
import {
  recordMode,
  transactionTypeField,
  transactionCategoryField,
} from '../../constants/fields'
import './index.less'
import {
  addTransactions,
  batchAddTransactions,
  getAllTransactions,
  updateTransactions,
  deleteTransactions,
} from '../../utils/transactions'
const dateFormat = 'YYYY-MM-DD'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [form] = Form.useForm()
  const mode = Form.useWatch('mode', form)

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.date - b.date,
    },
    {
      title: '描述',
      dataIndex: 'describe',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      align: 'center',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '分类',
      dataIndex: 'classification',
      render: (value) => {
        const label = transactionCategoryField.options.find(
          (item) => item.value === value
        )?.label
        return <span>{label}</span>
      },
      align: 'center',
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      render: (value) => {
        const label = transactionTypeField.options.find(
          (item) => item.value === value
        )?.label
        return <span>{label}</span>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showModal(record)}>编辑</a>
          <a onClick={() => deleteList(record)}>删除</a>
        </Space>
      ),
    },
  ]

  const initPage = async () => {
    try {
      const { code, data } = await getAllTransactions()
      if (code === 200) {
        setTransactions(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // 保存
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  }

  const recordModeChange = (e) => {
    form.setFieldsValue({
      mode: e.target.value,
    })
  }

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  }

  // 新增或者编辑一条记录
  const showModal = (value) => {
    setOpen(true)
    if (value === 'add') {
      setModalTitle('新增')
      form.resetFields()
      form.setFieldsValue({
        mode: 'batch',
        id: '',
      })
    } else {
      setModalTitle('编辑')
      form.setFieldsValue({
        ...value,
        id: value.id,
        mode: 'single',
        date: dayjs(value.date),
      })
    }
  }

  // 更新列表

  // 提交表单
  const handleOk = async () => {
    setConfirmLoading(true)
    let values = form.getFieldsValue()
    const date = dayjs(values.date).format(dateFormat)
    let params
    // 批量记录的逻辑
    if (mode === 'batch') {
      const regex = /([^0-9.元]+?)(\d+\.?\d*)元/g
      let match
      params = []
      while ((match = regex.exec(values.batchDescribe)) !== null) {
        const describe = match[1].replace(/[，。、]/g, '').trim()
        const amount = parseFloat(match[2])
        params.push({
          describe,
          amount,
          date,
          type: values.type,
        })
      }
      try {
        let res = await batchAddTransactions(params)
        if (res.code === 200) {
          await initPage()
        }
      } catch (error) {
        console.log(error)
      } finally {
        setConfirmLoading(false)
        setOpen(false)
      }
    }

    // 单条数据的处理
    if (mode === 'single') {
      try {
        if (modalTitle === '新增') {
          let res = await addTransactions({
            ...values,
            date,
          })
          if (res.code === 200) {
            await initPage()
          }
        }
        if (modalTitle === '编辑') {
          let res = await updateTransactions(values.id, {
            ...values,
            date,
          })
          if (res.code === 200) {
            await initPage()
          }
        }
      } catch (error) {
        console.log(error)
      } finally {
        setConfirmLoading(false)
        setOpen(false)
      }
    }
  }

  // 取消提交表单
  const handleCancel = () => {
    setOpen(false)
  }

  // 数据删除
  const deleteList = async (item) => {
    let res = await deleteTransactions(item.id, item)
    if (res.code === 200) {
      await initPage()
    }
  }

  useEffect(() => {
    initPage()
  }, [])

  return (
    <div className="transaction">
      <Space size={12}>
        <RangePicker />
        <Button type="primary" onClick={() => showModal('add')}>
          新增
        </Button>
      </Space>
      <Modal
        title={modalTitle}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <Form
          {...layout}
          name="nest-messages"
          form={form}
          style={{ maxWidth: 600 }}
          validateMessages={validateMessages}
          initialValues={{
            type: transactionTypeField.defaultValue,
            classification: transactionCategoryField.defaultValue,
            date: dayjs(dayjs(), dateFormat),
            mode,
          }}
        >
          {/* 使用一个隐藏的 Input，确保它被 Form 追踪 */}
          <Form.Item name="id" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="mode"
            label="记录方式"
            wrapperCol={{ span: 10 }}
            rules={[{ required: true }]}
          >
            <Radio.Group
              block
              buttonStyle="solid"
              optionType="button"
              options={recordMode.options}
              onChange={recordModeChange}
            />
          </Form.Item>

          <Form.Item name="date" label="日期">
            <DatePicker format={dateFormat} />
          </Form.Item>

          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group
              options={transactionTypeField.options}
              style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}
            />
          </Form.Item>

          {mode === 'batch' && (
            <Form.Item tooltip="格式：" name="batchDescribe" label="描述">
              <Input.TextArea
                autoSize={{ minRows: 3, maxRows: 10 }}
                placeholder="请输入"
                maxLength={1000}
              />
            </Form.Item>
          )}

          {mode !== 'batch' && (
            <Form.Item
              name="classification"
              label="分类"
              wrapperCol={{ span: 20 }}
              rules={[{ type: 'classification' }]}
            >
              <Radio.Group
                options={transactionCategoryField.options}
                style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}
              />
            </Form.Item>
          )}

          {mode !== 'batch' && (
            <Form.Item
              name="amount"
              label="金额"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber />
            </Form.Item>
          )}

          {mode !== 'batch' && (
            <Form.Item name="describe" label="描述">
              <Input.TextArea />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Table
        size="small"
        columns={columns}
        dataSource={transactions}
        bordered
        rowKey="id"
        footer={() => 'Footer'}
      />
    </div>
  )
}
export default Transactions
