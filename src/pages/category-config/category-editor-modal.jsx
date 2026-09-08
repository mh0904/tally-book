import { Form, Input, InputNumber, Modal, Radio, Switch } from 'antd'
import { TagsOutlined } from '@ant-design/icons'
import { CATEGORY_TYPES } from './category-utils'

const CategoryEditorModal = ({
  editingValue,
  form,
  onCancel,
  onSave,
  open,
  saving,
}) => {
  return (
    <Modal
      cancelText="取消"
      confirmLoading={saving}
      okText="保存"
      onCancel={onCancel}
      onOk={onSave}
      open={open}
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
  )
}

export default CategoryEditorModal
