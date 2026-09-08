import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Switch,
  Tag,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  LockOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { getRoleName } from './user-utils'

const { Text } = Typography

const UserEditorPanel = ({
  canDelete,
  draftUser,
  editingUser,
  form,
  isAdminUser,
  onDelete,
  onSave,
  roleOptions,
  roles,
  saving,
}) => {
  return (
    <section className="user-editor-panel page-panel">
      <div className="panel-heading">
        <div>
          <h3>{draftUser ? '新增成员' : '编辑成员'}</h3>
          {editingUser ? (
            <span>
              当前成员：<Text strong>{editingUser.name || editingUser.username}</Text>
            </span>
          ) : (
            <span>请选择一个成员</span>
          )}
        </div>
        {editingUser && (
          <Tag color={isAdminUser ? 'gold' : 'orange'}>
            {isAdminUser ? '内置管理员' : getRoleName(roles, editingUser.roleId)}
          </Tag>
        )}
      </div>

      {editingUser ? (
        <Form
          className="user-edit-form"
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <div className="user-form-row">
            <Form.Item
              label="登录账号"
              name="username"
              rules={[{ required: true, message: '请输入登录账号' }]}
            >
              <Input
                disabled={isAdminUser}
                maxLength={30}
                placeholder="请输入登录账号"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="成员姓名"
              name="name"
              rules={[{ required: true, message: '请输入成员姓名' }]}
            >
              <Input maxLength={20} placeholder="请输入成员姓名" />
            </Form.Item>
          </div>

          <div className="user-form-row">
            <Form.Item
              label="所属角色"
              name="roleId"
              rules={[{ required: true, message: '请选择所属角色' }]}
            >
              <Select disabled={isAdminUser} options={roleOptions} />
            </Form.Item>

            <Form.Item
              label="登录密码"
              name="password"
              rules={[
                {
                  required: Boolean(draftUser),
                  message: '请输入登录密码',
                },
                {
                  min: 4,
                  message: '密码至少 4 位',
                },
              ]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder={draftUser ? '请输入登录密码' : '留空表示不修改密码'}
                prefix={<LockOutlined />}
              />
            </Form.Item>
          </div>

          <div className="user-form-row small">
            <Form.Item
              label="排序"
              name="sort"
              rules={[{ required: true, message: '请输入排序值' }]}
            >
              <InputNumber disabled={isAdminUser} min={1} precision={0} />
            </Form.Item>

            <Form.Item label="状态" name="enabled" valuePropName="checked">
              <Switch
                checkedChildren="启用"
                disabled={isAdminUser}
                unCheckedChildren="停用"
              />
            </Form.Item>
          </div>

          <div className="user-form-actions">
            <Popconfirm
              cancelText="取消"
              disabled={!canDelete}
              okButtonProps={{ danger: true }}
              okText="删除"
              onConfirm={onDelete}
              title="确认删除该成员？"
            >
              <Button danger disabled={!canDelete} icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
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
        <Empty description="请选择左侧成员" />
      )}
    </section>
  )
}

export default UserEditorPanel
