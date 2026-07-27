import React from 'react'
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
  Tree,
  Typography,
  message,
} from 'antd'
import {
  BranchesOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { MENU_ICON_OPTIONS, renderMenuIcon } from '../../common/menuIcons'
import {
  sortMenuTree,
} from '../../config/menu'
import { resetMenus } from '../../utils/menus'
import './index.less'

const { Text } = Typography

const createMenuId = () =>
  `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const findMenuInfoById = (menus, id, depth = 0, parentId = null) => {
  for (const item of menus) {
    if (item.id === id) {
      return { item, depth, parentId }
    }

    if (item.children?.length) {
      const found = findMenuInfoById(item.children, id, depth + 1, item.id)

      if (found) {
        return found
      }
    }
  }

  return null
}

const getAllMenuKeys = (menus) =>
  menus.reduce((keys, item) => {
    return [...keys, item.id, ...getAllMenuKeys(item.children || [])]
  }, [])

const getNextSort = (menus) => {
  const maxSort = menus.reduce(
    (max, item) => Math.max(max, Number(item.sort || 0)),
    0
  )
  return maxSort + 1
}

const createMenu = ({ title, sort }) => ({
  id: createMenuId(),
  title,
  icon: 'menu',
  path: '',
  enabled: true,
  sort,
})

const addMenuToTree = (menus, parentId, nextMenu) => {
  if (!parentId) {
    return sortMenuTree([...menus, nextMenu])
  }

  return sortMenuTree(
    menus.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: sortMenuTree([...(item.children || []), nextMenu]),
        }
      }

      if (item.children?.length) {
        return {
          ...item,
          children: addMenuToTree(item.children, parentId, nextMenu),
        }
      }

      return item
    })
  )
}

const updateMenuInTree = (menus, selectedId, values) =>
  sortMenuTree(
    menus.map((item) => {
      if (item.id === selectedId) {
        return {
          ...item,
          title: values.title.trim(),
          icon: values.icon,
          path: values.path?.trim() || '',
          sort: values.sort,
          enabled: values.enabled,
        }
      }

      if (item.children?.length) {
        return {
          ...item,
          children: updateMenuInTree(item.children, selectedId, values),
        }
      }

      return item
    })
  )

const getTreeTitle = (item) => (
  <div className="menu-tree-title">
    <span className="menu-tree-icon">{renderMenuIcon(item.icon)}</span>
    <span className="menu-tree-name">{item.title}</span>
    <Tag color={item.enabled ? 'success' : 'default'}>
      {item.enabled ? '启用' : '禁用'}
    </Tag>
  </div>
)

const createTreeData = (menus) =>
  menus.map((item) => ({
    key: item.id,
    title: getTreeTitle(item),
    children: item.children?.length ? createTreeData(item.children) : undefined,
  }))

const iconSelectOptions = MENU_ICON_OPTIONS.map((item) => ({
  value: item.value,
  label: (
    <Space size={6}>
      {renderMenuIcon(item.value)}
      {item.label}
    </Space>
  ),
}))

const MenuConfig = ({ menus, onMenusChange, onMenusRefresh }) => {
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)
  const [draftMenu, setDraftMenu] = React.useState(null)
  const [selectedId, setSelectedId] = React.useState(menus[0]?.id)
  const [expandedKeys, setExpandedKeys] = React.useState(getAllMenuKeys(menus))

  const selectedInfo = React.useMemo(
    () => findMenuInfoById(menus, selectedId),
    [menus, selectedId]
  )
  const selectedMenu = selectedInfo?.item
  const editingMenu = draftMenu?.menu || selectedMenu
  const editingInfo = draftMenu
    ? {
        depth: draftMenu.depth,
        parentId: draftMenu.parentId,
      }
    : selectedInfo
  const treeData = React.useMemo(() => createTreeData(menus), [menus])

  React.useEffect(() => {
    setExpandedKeys(getAllMenuKeys(menus))

    if (draftMenu) {
      return
    }

    if (!findMenuInfoById(menus, selectedId)) {
      setSelectedId(menus[0]?.id)
    }
  }, [draftMenu, menus, selectedId])

  React.useEffect(() => {
    if (!editingMenu) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      title: editingMenu.title,
      path: editingMenu.path,
      icon: editingMenu.icon,
      sort: editingMenu.sort,
      enabled: editingMenu.enabled,
    })
  }, [editingMenu, form])

  const persistMenus = async (nextMenus, successMsg) => {
    setSaving(true)

    try {
      const savedMenus = await onMenusChange(nextMenus)
      message.success(successMsg)
      return savedMenus
    } catch (error) {
      message.error(error.message || '菜单保存失败')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleAddParent = () => {
    const nextMenu = createMenu({
      title: '新建父级菜单',
      sort: getNextSort(menus),
    })

    setSelectedId(null)
    setDraftMenu({
      depth: 0,
      menu: nextMenu,
      parentId: null,
    })
  }

  const handleAddChild = () => {
    if (draftMenu || !selectedMenu || selectedInfo?.depth !== 0) {
      message.warning('请先选择一个父级菜单')
      return
    }

    const children = selectedMenu.children || []
    const nextMenu = createMenu({
      title: '新建子级菜单',
      sort: getNextSort(children),
    })

    setSelectedId(null)
    setDraftMenu({
      depth: selectedInfo.depth + 1,
      menu: nextMenu,
      parentId: selectedMenu.id,
    })
  }

  const handleSave = async () => {
    if (!editingMenu) {
      return
    }

    const values = await form.validateFields()
    const nextMenu = {
      ...editingMenu,
      title: values.title.trim(),
      icon: values.icon,
      path: values.path?.trim() || '',
      sort: values.sort,
      enabled: values.enabled,
    }
    const nextMenus = draftMenu
      ? addMenuToTree(menus, draftMenu.parentId, nextMenu)
      : updateMenuInTree(menus, selectedMenu.id, values)
    const savedMenus = await persistMenus(nextMenus, '菜单配置已保存')

    if (savedMenus) {
      setDraftMenu(null)
      setSelectedId(nextMenu.id)
    }
  }

  const handleReset = async () => {
    setSaving(true)

    try {
      const { code, data, msg } = await resetMenus()

      if (code !== 200) {
        throw new Error(msg || '恢复默认菜单失败')
      }

      const savedMenus = onMenusRefresh
        ? await onMenusRefresh()
        : sortMenuTree(data)
      setDraftMenu(null)
      setSelectedId(savedMenus[0]?.id)
      message.success('已恢复默认菜单')
    } catch (error) {
      message.error(error.message || '恢复默认菜单失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="menu-config-page">
      <div className="menu-config-toolbar">
        <div>
          <h2>菜单配置</h2>
          <span>维护后台菜单树、路由地址和启用状态</span>
        </div>
        <Space wrap>
          <Button
            disabled={saving}
            icon={<PlusOutlined />}
            onClick={handleAddParent}
          >
            新增父级菜单
          </Button>
          <Button
            disabled={
              saving ||
              Boolean(draftMenu) ||
              !selectedMenu ||
              selectedInfo?.depth !== 0
            }
            icon={<BranchesOutlined />}
            onClick={handleAddChild}
            type="primary"
          >
            新增子级菜单
          </Button>
          <Button disabled={saving} icon={<ReloadOutlined />} onClick={handleReset}>
            恢复默认
          </Button>
        </Space>
      </div>

      <div className="menu-config-layout">
        <section className="menu-tree-panel page-panel">
          <div className="panel-heading">
            <div>
              <h3>菜单树</h3>
              <span>点击节点后在右侧编辑</span>
            </div>
          </div>
          {treeData.length ? (
            <Tree
              blockNode
              className="menu-tree"
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              onSelect={(keys) => {
                setDraftMenu(null)
                setSelectedId(keys[0])
              }}
              selectedKeys={!draftMenu && selectedId ? [selectedId] : []}
              treeData={treeData}
            />
          ) : (
            <Empty description="暂无菜单" />
          )}
        </section>

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
              <Tag color={draftMenu ? 'orange' : 'blue'}>
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
                  onClick={handleSave}
                  type="primary"
                >
                  保存菜单
                </Button>
              </div>
            </Form>
          ) : (
            <Empty description="请选择左侧菜单" />
          )}
        </section>
      </div>
    </div>
  )
}

export default MenuConfig
