import React from 'react'
import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  DeleteOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { resetUsers } from '../../api/users'
import {
  ADMIN_USER_ID,
  normalizeUser,
  sortUsers,
} from '../../config/users'
import './index.less'

const { Text } = Typography

const createUserId = () =>
  `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getNextSort = (users) => {
  const maxSort = users.reduce(
    (max, user) => Math.max(max, Number(user.sort || 0)),
    0
  )
  return maxSort + 1
}

const findUserById = (users, id) => users.find((user) => user.id === id)

const getRoleName = (roles, roleId) =>
  roles.find((role) => role.id === roleId)?.name || '未分配角色'

const UserConfig = ({
  currentUserId,
  onUsersChange,
  onUsersRefresh,
  roles,
  users,
}) => {
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)
  const [draftUser, setDraftUser] = React.useState(null)
  const [selectedId, setSelectedId] = React.useState(users[0]?.id)

  const selectedUser = React.useMemo(
    () => findUserById(users, selectedId),
    [users, selectedId]
  )
  const editingUser = draftUser || selectedUser
  const isAdminUser = editingUser?.id === ADMIN_USER_ID
  const canDelete =
    Boolean(selectedUser) &&
    selectedUser.id !== ADMIN_USER_ID &&
    selectedUser.id !== currentUserId &&
    !draftUser
  const roleOptions = React.useMemo(
    () =>
      roles
        .filter((role) => role.enabled !== false)
        .map((role) => ({
          label: role.name,
          value: role.id,
        })),
    [roles]
  )

  React.useEffect(() => {
    if (draftUser) {
      return
    }

    if (!findUserById(users, selectedId)) {
      setSelectedId(users[0]?.id)
    }
  }, [draftUser, selectedId, users])

  React.useEffect(() => {
    if (!editingUser) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      username: editingUser.username,
      name: editingUser.name,
      roleId: editingUser.roleId,
      enabled: editingUser.enabled,
      sort: editingUser.sort,
      password: '',
    })
  }, [editingUser, form])

  const persistUsers = async (nextUsers, successMsg) => {
    setSaving(true)

    try {
      const savedUsers = await onUsersChange(sortUsers(nextUsers))
      message.success(successMsg)
      return savedUsers
    } catch (error) {
      message.error(error.message || '用户保存失败')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleAddUser = () => {
    const fallbackRoleId =
      roles.find((role) => role.id === 'viewer' && role.enabled !== false)?.id ||
      roles.find((role) => role.id !== 'admin' && role.enabled !== false)?.id ||
      'viewer'
    const nextUser = normalizeUser({
      id: createUserId(),
      username: '',
      name: '',
      roleId: fallbackRoleId,
      enabled: true,
      sort: getNextSort(users),
    })

    setSelectedId(null)
    setDraftUser(nextUser)
  }

  const handleSave = async () => {
    if (!editingUser) {
      return
    }

    const values = await form.validateFields()
    const nextUser = normalizeUser({
      ...editingUser,
      username: values.username.trim(),
      name: values.name.trim(),
      roleId: values.roleId,
      enabled: values.enabled,
      sort: values.sort,
      ...(values.password ? { password: values.password } : {}),
    })
    const nextUsers = draftUser
      ? [...users, nextUser]
      : users.map((user) => (user.id === nextUser.id ? nextUser : user))
    const savedUsers = await persistUsers(nextUsers, '用户配置已保存')

    if (savedUsers) {
      setDraftUser(null)
      setSelectedId(nextUser.id)
    }
  }

  const handleDelete = async () => {
    if (!canDelete) {
      return
    }

    const nextUsers = users.filter((user) => user.id !== selectedUser.id)
    const savedUsers = await persistUsers(nextUsers, '用户已删除')

    if (savedUsers) {
      setDraftUser(null)
      setSelectedId(savedUsers[0]?.id)
    }
  }

  const handleReset = async () => {
    setSaving(true)

    try {
      const { code, data, msg } = await resetUsers()

      if (code !== 200) {
        throw new Error(msg || '恢复默认用户失败')
      }

      const savedUsers = onUsersRefresh ? await onUsersRefresh() : sortUsers(data)
      setDraftUser(null)
      setSelectedId(savedUsers[0]?.id)
      message.success('已恢复默认用户')
    } catch (error) {
      message.error(error.message || '恢复默认用户失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="user-config-page">
      <div className="user-config-toolbar">
        <div>
          <h2>用户管理</h2>
          <span>维护登录账号、密码、启用状态，并为用户绑定角色</span>
        </div>
        <Space wrap>
          <Button
            disabled={saving}
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            type="primary"
          >
            新增用户
          </Button>
          <Button disabled={saving} icon={<ReloadOutlined />} onClick={handleReset}>
            恢复默认
          </Button>
        </Space>
      </div>

      <div className="user-config-layout">
        <section className="user-list-panel page-panel">
          <div className="panel-heading">
            <div>
              <h3>用户列表</h3>
              <span>当前共 {users.length} 个用户</span>
            </div>
          </div>
          <div className="user-list">
            {users.map((user) => (
              <button
                className={[
                  'user-list-item',
                  !draftUser && selectedId === user.id ? 'active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={user.id}
                onClick={() => {
                  setDraftUser(null)
                  setSelectedId(user.id)
                }}
                type="button"
              >
                <span className="user-list-icon">
                  <UserOutlined />
                </span>
                <span className="user-list-content">
                  <strong>{user.name || user.username}</strong>
                  <em>
                    {user.username} · {getRoleName(roles, user.roleId)}
                  </em>
                </span>
                <Tag color={user.enabled ? 'success' : 'default'}>
                  {user.enabled ? '启用' : '停用'}
                </Tag>
              </button>
            ))}
          </div>
        </section>

        <section className="user-editor-panel page-panel">
          <div className="panel-heading">
            <div>
              <h3>{draftUser ? '新增用户' : '编辑用户'}</h3>
              {editingUser ? (
                <span>
                  当前用户：<Text strong>{editingUser.name || editingUser.username}</Text>
                </span>
              ) : (
                <span>请选择一个用户</span>
              )}
            </div>
            {editingUser && (
              <Tag color={isAdminUser ? 'gold' : 'blue'}>
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
                  label="用户姓名"
                  name="name"
                  rules={[{ required: true, message: '请输入用户姓名' }]}
                >
                  <Input maxLength={20} placeholder="请输入用户姓名" />
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
                  okText="删除"
                  okButtonProps={{ danger: true }}
                  onConfirm={handleDelete}
                  title="确认删除该用户？"
                >
                  <Button danger disabled={!canDelete} icon={<DeleteOutlined />}>
                    删除用户
                  </Button>
                </Popconfirm>
                <Button
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={handleSave}
                  type="primary"
                >
                  保存用户
                </Button>
              </div>
            </Form>
          ) : (
            <Empty description="请选择左侧用户" />
          )}
        </section>
      </div>
    </div>
  )
}

export default UserConfig
