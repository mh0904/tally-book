import { DatePicker, Form, Input, InputNumber, Select } from 'antd'
import { DATE_FORMAT } from '../../utils/book-stats'
import {
  ACCOUNT_OPTIONS,
  BATCH_MODE_OPTIONS,
  MEMBER_OPTIONS,
  MERCHANT_OPTIONS,
  PROJECT_OPTIONS,
} from './record-options'

const RecordForm = ({
  batchMode,
  categoryOptions,
  entryMode,
  form,
  onBatchModeChange,
  onTypeChange,
  transactionType,
  transactionTypeOptions,
}) => {
  return (
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
        {transactionTypeOptions.map((item) => (
          <button
            className={transactionType === item.value ? 'active' : ''}
            key={item.value}
            onClick={() => onTypeChange(item.value)}
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
              onClick={() => onBatchModeChange(item.value)}
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
              disabled={!categoryOptions.length}
              options={categoryOptions}
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
  )
}

export default RecordForm
