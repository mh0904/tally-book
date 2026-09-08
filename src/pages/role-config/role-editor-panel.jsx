import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Switch,
  Tag,
  Tree,
  Typography,
} from 'antd'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { renderMenuIcon } from '../../common/menu-icons'

const { Text } = Typography

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

const RoleEditorPanel = ({
  checkedKeys,
  draftRole,
  editingRole,
  expandedKeys,
  form,
  isAdmin,
  menus,
  onCheck,
  onDelete,
  onExpand,
  onSave,
  saving,
  selectedRole,
}) => {
  const treeData = createPermissionTreeData(menus)
  const canDelete = selectedRole && !isAdmin && !draftRole

  return (
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

              <Form.Item label="状态" name="enabled" valuePropName="checked">
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
                disabled={!canDelete}
                okButtonProps={{ danger: true }}
                okText="删除"
                onConfirm={onDelete}
                title="确认删除该角色？"
              >
                <Button danger disabled={!canDelete} icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
              <Button
                disabled={isAdmin}
                icon={<SaveOutlined />}
                loading={saving}
                onClick={onSave}
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
                onCheck={onCheck}
                onExpand={onExpand}
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
  )
}

export default RoleEditorPanel
