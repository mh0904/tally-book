import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { MENU_ICON_OPTIONS, renderMenuIcon } from '../../common/menu-icons'

const { Text } = Typography

const iconSelectOptions = MENU_ICON_OPTIONS.map((item) => ({
  value: item.value,
  label: (
    <Space size={6}>
      {renderMenuIcon(item.value)}
      {item.label}
    </Space>
  ),
}))

const MenuEditorPanel = ({
  draftMenu,
  editingInfo,
  editingMenu,
  form,
  onSave,
  saving,
}) => {
  return (
    <section className="menu-editor-panel page-panel">
      <div className="panel-heading">
        <div>
          <h3>{draftMenu ? '新增菜单' : '编辑菜单'}</h3>
          {editingMenu ? (
            <span>
              当前编辑：
              <Text strong>{editingMenu.title}</Text>
            </span>
          ) : (
            <span>请选择一个菜单节点</span>
          )}
        </div>
        {editingInfo && (
          <Tag color="orange">
            {editingInfo.depth === 0 ? '父级菜单' : '子级菜单'}
          </Tag>
        )}
      </div>

      {editingMenu ? (
        <Form
          className="menu-edit-form"
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="菜单名称"
            name="title"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input maxLength={20} placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item label="路由地址" name="path">
            <Input placeholder="例如 /menu-config，父级菜单可留空" />
          </Form.Item>

          <div className="menu-form-row">
            <Form.Item
              label="菜单图标"
              name="icon"
              rules={[{ required: true, message: '请选择菜单图标' }]}
            >
              <Select options={iconSelectOptions} />
            </Form.Item>

            <Form.Item
              label="排序"
              name="sort"
              rules={[{ required: true, message: '请输入排序值' }]}
            >
              <InputNumber min={1} precision={0} />
            </Form.Item>
          </div>

          <Form.Item label="状态" name="enabled" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <div className="menu-form-actions">
            <Button
              icon={<SaveOutlined />}
              loading={saving}
              onClick={onSave}
              type="primary"
            >
              保存
            </Button>
          </div>
        </Form>
      ) : (
        <Empty description="请选择左侧菜单" />
      )}
    </section>
  )
}

export default MenuEditorPanel
