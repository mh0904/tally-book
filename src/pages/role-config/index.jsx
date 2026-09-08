import React from 'react'
import { Form, message } from 'antd'
import { resetRoles } from '../../api/roles'
import {
  ADMIN_ROLE_ID,
  getAllMenuIds,
  normalizeRole,
  sortRoles,
} from '../../config/roles'
import RoleEditorPanel from './role-editor-panel'
import RoleListPanel from './role-list-panel'
import RoleToolbar from './role-toolbar'
import {
  createRoleId,
  findRoleById,
  getNextSort,
  getRoleCheckedKeys,
} from './role-utils'
import './index.less'

const RoleConfig = ({ roles, menus, onRolesChange, onRolesRefresh }) => {
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)
  const [draftRole, setDraftRole] = React.useState(null)
  const [selectedId, setSelectedId] = React.useState(roles[0]?.id)
  const [checkedKeys, setCheckedKeys] = React.useState([])
  const [expandedKeys, setExpandedKeys] = React.useState(getAllMenuIds(menus))

  const selectedRole = React.useMemo(
    () => findRoleById(roles, selectedId),
    [roles, selectedId]
  )
  const editingRole = draftRole || selectedRole
  const isAdmin = editingRole?.id === ADMIN_ROLE_ID

  React.useEffect(() => {
    setExpandedKeys(getAllMenuIds(menus))
  }, [menus])

  React.useEffect(() => {
    if (draftRole) {
      return
    }

    if (!findRoleById(roles, selectedId)) {
      setSelectedId(roles[0]?.id)
    }
  }, [draftRole, roles, selectedId])

  React.useEffect(() => {
    if (!editingRole) {
      form.resetFields()
      setCheckedKeys([])
      return
    }

    form.setFieldsValue({
      name: editingRole.name,
      description: editingRole.description,
      enabled: editingRole.enabled,
      sort: editingRole.sort,
    })
    setCheckedKeys(getRoleCheckedKeys(editingRole, menus))
  }, [editingRole, form, menus])

  const persistRoles = async (nextRoles, successMsg) => {
    setSaving(true)

    try {
      const savedRoles = await onRolesChange(sortRoles(nextRoles))
      message.success(successMsg)
      return savedRoles
    } catch (error) {
      message.error(error.message || '角色保存失败')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleAddRole = () => {
    const nextRole = normalizeRole({
      id: createRoleId(),
      name: '新建角色',
      description: '',
      enabled: true,
      sort: getNextSort(roles),
      menuIds: ['home'],
    })

    setSelectedId(null)
    setDraftRole(nextRole)
  }

  const handleSave = async () => {
    if (!editingRole || isAdmin) {
      return
    }

    const values = await form.validateFields()
    const nextRole = normalizeRole({
      ...editingRole,
      name: values.name.trim(),
      description: values.description?.trim() || '',
      enabled: values.enabled,
      sort: values.sort,
      menuIds: checkedKeys,
    })
    const nextRoles = draftRole
      ? [...roles, nextRole]
      : roles.map((role) => (role.id === nextRole.id ? nextRole : role))
    const savedRoles = await persistRoles(nextRoles, '角色配置已保存')

    if (savedRoles) {
      setDraftRole(null)
      setSelectedId(nextRole.id)
    }
  }

  const handleDelete = async () => {
    if (!selectedRole || selectedRole.id === ADMIN_ROLE_ID) {
      return
    }

    const nextRoles = roles.filter((role) => role.id !== selectedRole.id)
    const savedRoles = await persistRoles(nextRoles, '角色已删除')

    if (savedRoles) {
      setDraftRole(null)
      setSelectedId(savedRoles[0]?.id)
    }
  }

  const handleReset = async () => {
    setSaving(true)

    try {
      const { code, data, msg } = await resetRoles()

      if (code !== 200) {
        throw new Error(msg || '恢复默认角色失败')
      }

      const savedRoles = onRolesRefresh ? await onRolesRefresh() : sortRoles(data)
      setDraftRole(null)
      setSelectedId(savedRoles[0]?.id)
      message.success('已恢复默认角色')
    } catch (error) {
      message.error(error.message || '恢复默认角色失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCheck = (nextCheckedKeys) => {
    setCheckedKeys(
      Array.isArray(nextCheckedKeys)
        ? nextCheckedKeys
        : nextCheckedKeys.checked || []
    )
  }

  return (
    <div className="role-config-page">
      <RoleToolbar
        onAdd={handleAddRole}
        onReset={handleReset}
        saving={saving}
      />

      <div className="role-config-layout">
        <RoleListPanel
          draftRole={draftRole}
          onSelect={(roleId) => {
            setDraftRole(null)
            setSelectedId(roleId)
          }}
          roles={roles}
          selectedId={selectedId}
        />

        <RoleEditorPanel
          checkedKeys={checkedKeys}
          draftRole={draftRole}
          editingRole={editingRole}
          expandedKeys={expandedKeys}
          form={form}
          isAdmin={isAdmin}
          menus={menus}
          onCheck={handleCheck}
          onDelete={handleDelete}
          onExpand={setExpandedKeys}
          onSave={handleSave}
          saving={saving}
          selectedRole={selectedRole}
        />
      </div>
    </div>
  )
}

export default RoleConfig
