import React from 'react'
import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Tree,
  Typography,
  message,
} from 'antd'
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { renderMenuIcon } from '../../common/menu-icons'
import { resetRoles } from '../../api/roles'
import {
  ADMIN_ROLE_ID,
  ALL_MENU_PERMISSION,
  getAllMenuIds,
  normalizeRole,
  sortRoles,
} from '../../config/roles'
import './index.less'

const { Text } = Typography

const createRoleId = () =>
  `role-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getNextSort = (roles) => {
  const maxSort = roles.reduce(
    (max, role) => Math.max(max, Number(role.sort || 0)),
    0
  )
  return maxSort + 1
}

const findRoleById = (roles, id) => roles.find((role) => role.id === id)

const getRoleCheckedKeys = (role, menus) => {
  if (!role) {
    return []
  }

  if (role.id === ADMIN_ROLE_ID || role.menuIds?.includes(ALL_MENU_PERMISSION)) {
    return getAllMenuIds(menus)
  }

  return role.menuIds || []
}

const createPermissionTreeData = (menus) =>
  menus.map((item) => ({
    key: item.id,
    title: (
      <div className="role-menu-tree-title">
        <span className="role-menu-tree-icon">{renderMenuIcon(item.icon)}</span>
        <span className="role-menu-tree-name">{item.title}</span>
        <Tag color={item.enabled ? 'success' : 'default'}>
          {item.enabled ? '启用' : '停用'}
        </Tag>
      </div>
    ),
    children: item.children?.length
      ? createPermissionTreeData(item.children)
      : undefined,
  }))

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
  const treeData = React.useMemo(() => createPermissionTreeData(menus), [menus])

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
      <div className="role-config-toolbar">
        <Space wrap>
          <Button
            disabled={saving}
            icon={<PlusOutlined />}
            onClick={handleAddRole}
            type="primary"
          >
            新增
          </Button>
          <Button disabled={saving} icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </div>

      <div className="role-config-layout">
        <section className="role-list-panel page-panel">
          <div className="panel-heading">
            <div>
              <h3>角色列表</h3>
              <span>当前共 {roles.length} 个角色</span>
            </div>
          </div>
          <div className="role-list">
            {roles.map((role) => (
              <button
                className={[
                  'role-list-item',
                  !draftRole && selectedId === role.id ? 'active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={role.id}
                onClick={() => {
                  setDraftRole(null)
                  setSelectedId(role.id)
                }}
                type="button"
              >
                <span className="role-list-icon">
                  <SafetyOutlined />
                </span>
                <span className="role-list-content">
                  <strong>{role.name}</strong>
                  <em>{role.description || '暂无描述'}</em>
                </span>
                <Tag color={role.enabled ? 'success' : 'default'}>
                  {role.enabled ? '启用' : '停用'}
                </Tag>
              </button>
            ))}
          </div>
        </section>

        <section className="role-editor-panel page-panel">
          <div className="panel-heading">
            <div>
              <h3>{draftRole ? '新增角色' : '编辑角色'}</h3>
              {editingRole ? (
                <span>
                  当前角色：<Text strong>{editingRole.name}</Text>
                </span>
              ) : (
                <span>请选择一个角色</span>
              )}
            </div>
            {editingRole && (
              <Tag color={isAdmin ? 'gold' : 'orange'}>
                {isAdmin ? '最高权限' : '自定义权限'}
              </Tag>
            )}
          </div>

          {editingRole ? (
            <div className="role-editor-grid">
              <Form
                className="role-edit-form"
                form={form}
                layout="vertical"
                requiredMark={false}
              >
                <Form.Item
                  label="角色名称"
                  name="name"
                  rules={[{ required: true, message: '请输入角色名称' }]}
                >
                  <Input
                    disabled={isAdmin}
                    maxLength={20}
                    placeholder="请输入角色名称"
                  />
                </Form.Item>

                <Form.Item label="角色说明" name="description">
                  <Input.TextArea
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    disabled={isAdmin}
                    maxLength={80}
                    placeholder="请输入角色说明"
                  />
                </Form.Item>

                <div className="role-form-row">
                  <Form.Item
                    label="排序"
                    name="sort"
                    rules={[{ required: true, message: '请输入排序值' }]}
                  >
                    <InputNumber disabled={isAdmin} min={1} precision={0} />
                  </Form.Item>

                  <Form.Item
                    label="状态"
                    name="enabled"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="启用"
                      disabled={isAdmin}
                      unCheckedChildren="停用"
                    />
                  </Form.Item>
                </div>

                <div className="role-form-actions">
                  <Popconfirm
                    cancelText="取消"
                    disabled={!selectedRole || isAdmin || Boolean(draftRole)}
                    okText="删除"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleDelete}
                    title="确认删除该角色？"
                  >
                    <Button
                      danger
                      disabled={!selectedRole || isAdmin || Boolean(draftRole)}
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                  <Button
                    disabled={isAdmin}
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                    type="primary"
                  >
                    保存
                  </Button>
                </div>
              </Form>

              <div className="role-permission-panel">
                <div className="role-permission-heading">
                  <h4>菜单权限</h4>
                  <span>
                    {isAdmin
                      ? '管理员默认拥有全部菜单权限'
                      : `已选择 ${checkedKeys.length} 个菜单节点`}
                  </span>
                </div>
                {treeData.length ? (
                  <Tree
                    checkable
                    checkedKeys={checkedKeys}
                    className="role-menu-tree"
                    disabled={isAdmin}
                    expandedKeys={expandedKeys}
                    onCheck={handleCheck}
                    onExpand={setExpandedKeys}
                    treeData={treeData}
                  />
                ) : (
                  <Empty description="暂无菜单" />
                )}
              </div>
            </div>
          ) : (
            <Empty description="请选择左侧角色" />
          )}
        </section>
      </div>
    </div>
  )
}

export default RoleConfig
