import React from 'react'
import { Form, message } from 'antd'
import { resetUsers } from '../../api/users'
import {
  ADMIN_USER_ID,
  normalizeUser,
  sortUsers,
} from '../../config/users'
import UserEditorPanel from './user-editor-panel'
import UserListPanel from './user-list-panel'
import UserToolbar from './user-toolbar'
import { createUserId, findUserById, getNextSort } from './user-utils'
import './index.less'

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
  const [showHidden, setShowHidden] = React.useState(false)

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
  const visibleUsers = React.useMemo(
    () => (showHidden ? users : users.filter((user) => user.enabled !== false)),
    [showHidden, users]
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
      message.error(error.message || '成员保存失败')
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
    const savedUsers = await persistUsers(nextUsers, '成员配置已保存')

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
    const savedUsers = await persistUsers(nextUsers, '成员已删除')

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
        throw new Error(msg || '恢复默认成员失败')
      }

      const savedUsers = onUsersRefresh ? await onUsersRefresh() : sortUsers(data)
      setDraftUser(null)
      setSelectedId(savedUsers[0]?.id)
      message.success('已恢复默认成员')
    } catch (error) {
      message.error(error.message || '恢复默认成员失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="user-config-page">
      <UserToolbar
        onAdd={handleAddUser}
        onReset={handleReset}
        onShowHiddenChange={setShowHidden}
        saving={saving}
        showHidden={showHidden}
      />

      <div className="user-config-layout">
        <UserListPanel
          draftUser={draftUser}
          onSelect={(userId) => {
            setDraftUser(null)
            setSelectedId(userId)
          }}
          roles={roles}
          selectedId={selectedId}
          users={visibleUsers}
        />

        <UserEditorPanel
          canDelete={canDelete}
          draftUser={draftUser}
          editingUser={editingUser}
          form={form}
          isAdminUser={isAdminUser}
          onDelete={handleDelete}
          onSave={handleSave}
          roleOptions={roleOptions}
          roles={roles}
          saving={saving}
        />
      </div>
    </div>
  )
}

export default UserConfig
