import React from 'react'
import { Form, message } from 'antd'
import { sortMenuTree } from '../../config/menu'
import { resetMenus } from '../../api/menus'
import MenuEditorPanel from './menu-editor-panel'
import MenuToolbar from './menu-toolbar'
import MenuTreePanel from './menu-tree-panel'
import {
  addMenuToTree,
  createMenu,
  findMenuInfoById,
  getAllMenuKeys,
  getNextSort,
  updateMenuInTree,
} from './menu-utils'
import './index.less'

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
      <MenuToolbar
        draftMenu={draftMenu}
        onAddChild={handleAddChild}
        onAddParent={handleAddParent}
        onReset={handleReset}
        saving={saving}
        selectedInfo={selectedInfo}
        selectedMenu={selectedMenu}
      />

      <div className="menu-config-layout">
        <MenuTreePanel
          draftMenu={draftMenu}
          expandedKeys={expandedKeys}
          menus={menus}
          onExpand={setExpandedKeys}
          onSelect={(keys) => {
            setDraftMenu(null)
            setSelectedId(keys[0])
          }}
          selectedId={selectedId}
        />

        <MenuEditorPanel
          draftMenu={draftMenu}
          editingInfo={editingInfo}
          editingMenu={editingMenu}
          form={form}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  )
}

export default MenuConfig
