import { useState, useEffect, useCallback } from 'react'
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
  const [form] = Form.useForm() // 用于新增/编辑 Modal 的表单
  const [searchForm] = Form.useForm() // 用于查询的表单
  const mode = Form.useWatch('mode', form)
  const [searchParams, setSearchParams] = useState({})

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      defaultSortOrder: 'descend',
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(), // 使用 dayjs 进行排序比较
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

  // 列表筛选
  const fetchTransactions = useCallback(async (params) => {
    try {
      const { code, data } = await getAllTransactions(params)
      if (code === 200) {
        setTransactions(data)
      }
    } catch (error) {
      console.log('获取交易记录失败:', error)
    }
  }, [])

  // 初始加载和查询
  useEffect(() => {
    fetchTransactions(searchParams)
  }, [searchParams, fetchTransactions])

  // 查询操作
  const onSearch = async (values) => {
    const { dateRange, ...restValues } = values
    let params = { ...restValues }

    if (dateRange && dateRange.length === 2) {
      // 格式化日期范围
      params.startDate = dateRange[0]
        ? dateRange[0].format(dateFormat)
        : undefined
      params.endDate = dateRange[1]
        ? dateRange[1].format(dateFormat)
        : undefined
    }

    // 排除值为 undefined 或空的字段
    Object.keys(params).forEach((key) => {
      if (
        params[key] === undefined ||
        params[key] === null ||
        params[key] === ''
      ) {
        delete params[key]
      }
    })

    setSearchParams(params)
  }

  // 重置查询
  const onReset = () => {
    searchForm.resetFields()
    setSearchParams({}) // 重置查询参数，触发 useEffect 重新获取数据
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
        date: dayjs(dayjs(), dateFormat),
        type: transactionTypeField.defaultValue,
        classification: transactionCategoryField.defaultValue,
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

  // 提交表单
  const handleOk = async () => {
    setConfirmLoading(true)
    try {
      await form.validateFields() // 确保表单验证通过
      let values = form.getFieldsValue()
      const date = dayjs(values.date).format(dateFormat)

      // 批量记录的逻辑
      if (mode === 'batch') {
        const regex = /([^0-9.元]+?)(\d+\.?\d*)元/g
        let match
        const params = []
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
        let res = await batchAddTransactions(params)
        if (res.code === 200) {
          await fetchTransactions(searchParams) // 刷新列表
        }
      }

      // 单条数据的处理
      if (mode === 'single') {
        if (modalTitle === '新增') {
          let res = await addTransactions({
            ...values,
            date,
          })
          if (res.code === 200) {
            await fetchTransactions(searchParams) // 刷新列表
          }
        }
        if (modalTitle === '编辑') {
          let res = await updateTransactions(values.id, {
            ...values,
            date,
          })
          if (res.code === 200) {
            await fetchTransactions(searchParams) // 刷新列表
          }
        }
      }
    } catch (error) {
      console.log('表单提交失败或接口调用错误:', error)
    } finally {
      setConfirmLoading(false)
      setOpen(false)
    }
  }

  // 取消提交表单
  const handleCancel = () => {
    setOpen(false)
  }

  // 数据删除
  const deleteList = async (item) => {
    try {
      let res = await deleteTransactions(item.id, item)
      if (res.code === 200) {
        await fetchTransactions(searchParams) // 刷新列表
      }
    } catch (error) {
      console.log('删除失败:', error)
    }
  }

  return (
    <div className="transaction">
      {/* 查询表单区域 */}
      <Form
        form={searchForm}
        layout="inline"
        onFinish={onSearch}
        className="search-form-wrap"
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="日期范围" name="dateRange">
          <RangePicker format={dateFormat} />
        </Form.Item>

        <Form.Item label="交易类型" name="type">
          <Select
            placeholder="请选择类型"
            allowClear
            style={{ width: 120 }}
            options={transactionTypeField.options}
          />
        </Form.Item>

        <Form.Item label="分类" name="classification">
          <Select
            placeholder="请选择分类"
            allowClear
            style={{ width: 120 }}
            options={transactionCategoryField.options}
          />
        </Form.Item>

        <Form.Item label="描述关键词" name="describe">
          <Input placeholder="请输入描述" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button htmlType="button" onClick={onReset}>
              重置
            </Button>
            <Button type="primary" onClick={() => showModal('add')}>
              新增
            </Button>
          </Space>
        </Form.Item>
      </Form>
      {/*  */}
      {/* 交易列表表格 */}
      <Table
        size="small"
        columns={columns}
        dataSource={transactions}
        bordered
        rowKey="id"
        footer={() => 'Footer'} // 暂时移除 Footer，保持简洁
      />

      {/* 新增/编辑 Modal (保持不变) */}
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
          // initialValues 依赖于 showModal 中设置的值，这里只需设置默认值
          initialValues={{
            mode: 'single', // 默认单条
            date: dayjs(dayjs(), dateFormat),
            type: transactionTypeField.defaultValue,
            classification: transactionCategoryField.defaultValue,
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
              disabled={modalTitle === '编辑'} // 编辑时不能切换模式
            />
          </Form.Item>

          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker format={dateFormat} />
          </Form.Item>

          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group
              options={transactionTypeField.options}
              style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}
            />
          </Form.Item>

          {/* 批量模式的输入 */}
          {mode === 'batch' &&
            modalTitle === '新增' && ( // 仅在新增且批量模式下显示
              <Form.Item
                tooltip="格式：描述1金额1元 描述2金额2元"
                name="batchDescribe"
                label="描述"
                rules={[{ required: true, message: '请输入批量描述内容' }]}
              >
                <Input.TextArea
                  autoSize={{ minRows: 3, maxRows: 10 }}
                  placeholder="请输入批量描述，例如：购买咖啡15元 晚餐60元"
                  maxLength={1000}
                />
              </Form.Item>
            )}

          {/* 单条模式或编辑模式的输入 */}
          {mode !== 'batch' && (
            <Form.Item
              name="classification"
              label="分类"
              wrapperCol={{ span: 20 }}
              rules={[{ required: true, message: '请选择分类' }]}
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
              rules={[
                {
                  type: 'number',
                  min: 0,
                  required: true,
                  message: '请输入金额',
                },
              ]}
            >
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          )}

          {mode !== 'batch' && (
            <Form.Item name="describe" label="描述">
              <Input.TextArea />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
export default Transactions
