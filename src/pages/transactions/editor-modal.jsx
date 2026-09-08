import dayjs from 'dayjs'
import { DatePicker, Form, Input, InputNumber, Modal, Radio } from 'antd'
import { recordMode, transactionTypeField } from '../../constants/fields'

const TransactionEditorModal = ({
  categoryOptions,
  confirmLoading,
  dateFormat,
  defaultCategoryValue,
  form,
  layout,
  mode,
  onCancel,
  onModeChange,
  onSubmit,
  onTypeChange,
  title,
  validateMessages,
  visible,
}) => {
  return (
    <Modal
      className="transaction-modal"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={onSubmit}
      open={visible}
      title={title}
      width={700}
    >
      <Form
        {...layout}
        form={form}
        initialValues={{
          classification: defaultCategoryValue,
          date: dayjs(dayjs(), dateFormat),
          mode: 'single',
          type: transactionTypeField.defaultValue,
          year: dayjs(dayjs(), 'YYYY'),
        }}
        name="nest-messages"
        style={{ maxWidth: 700 }}
        validateMessages={validateMessages}
      >
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item
          label="记录方式"
          name="mode"
          rules={[{ required: true }]}
          wrapperCol={{ span: 10 }}
        >
          <Radio.Group
            block
            buttonStyle="solid"
            disabled={title === '编辑'}
            onChange={onModeChange}
            optionType="button"
            options={recordMode.options}
          />
        </Form.Item>

        {mode !== 'severalDaysBatch' && (
          <Form.Item label="日期" name="date" rules={[{ required: true }]}>
            <DatePicker format={dateFormat} />
          </Form.Item>
        )}

        {mode === 'severalDaysBatch' && (
          <Form.Item label="年份" name="year" rules={[{ required: true }]}>
            <DatePicker picker="year" />
          </Form.Item>
        )}

        <Form.Item label="类型" name="type" rules={[{ required: true }]}>
          <Radio.Group
            onChange={(event) => onTypeChange(event.target.value)}
            options={transactionTypeField.options}
            style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}
          />
        </Form.Item>

        {mode === 'oddDaysBatch' && (
          <Form.Item
            label="描述"
            name="oddDaysBatchDescribe"
            rules={[{ required: true, message: '请输入批量描述内容' }]}
            tooltip="格式:拼多多9.5元,牛奶17.8元"
          >
            <Input.TextArea
              autoSize={{ minRows: 5, maxRows: 10 }}
              maxLength={1000}
              placeholder="请输入批量描述,例如:拼多多9.5元,牛奶17.8元"
            />
          </Form.Item>
        )}

        {mode === 'severalDaysBatch' && (
          <Form.Item
            label="描述"
            name="severalDaysBatchDescribe"
            rules={[{ required: true, message: '请输入批量描述内容' }]}
            tooltip="格式:8月1号拼多多9.5元8月2号吸油棉4.9元"
          >
            <Input.TextArea
              autoSize={{ minRows: 10, maxRows: 10 }}
              maxLength={100000}
              placeholder="请输入多日批量描述,例如:8月1号拼多多9.5元8月2号吸油棉4.9元"
            />
          </Form.Item>
        )}

        {mode === 'single' && (
          <Form.Item
            label="分类"
            name="classification"
            rules={[{ required: true, message: '请选择分类' }]}
            wrapperCol={{ span: 20 }}
          >
            <Radio.Group
              disabled={!categoryOptions.length}
              options={categoryOptions}
              style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}
            />
          </Form.Item>
        )}

        {mode === 'single' && (
          <Form.Item
            label="金额"
            name="amount"
            rules={[
              {
                message: '请输入金额',
                min: 0,
                required: true,
                type: 'number',
              },
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        )}

        {mode === 'single' && (
          <Form.Item label="描述" name="describe">
            <Input.TextArea />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default TransactionEditorModal
