import { Button, DatePicker, Form, Input, Select, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

const TransactionSearchForm = ({
  categoryOptions,
  dateFormat,
  form,
  onExport,
  onReset,
  onSearch,
  typeOptions,
}) => {
  return (
    <Form
      className="search-form-wrap"
      form={form}
      layout="inline"
      onFinish={onSearch}
      style={{ marginBottom: 16 }}
    >
      <Form.Item label="日期范围" name="dateRange">
        <RangePicker format={dateFormat} />
      </Form.Item>

      <Form.Item label="交易类型" name="type">
        <Select
          allowClear
          onChange={() => {
            form.setFieldsValue({ classification: undefined })
          }}
          options={typeOptions}
          placeholder="请选择类型"
          style={{ width: 120 }}
        />
      </Form.Item>

      <Form.Item label="分类" name="classification">
        <Select
          allowClear
          disabled={!categoryOptions.length}
          options={categoryOptions}
          placeholder="请选择分类"
          style={{ width: 140 }}
        />
      </Form.Item>

      <Form.Item label="描述关键词" name="describe">
        <Input placeholder="请输入描述" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button htmlType="submit" type="primary">
            查询
          </Button>
          <Button htmlType="button" onClick={onReset}>
            重置
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onExport} type="primary">
            导出
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default TransactionSearchForm
