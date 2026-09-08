// src/components/sidebar/index.jsx
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { renderMenuIcon } from '../../common/menu-icons'
import './index.less'

const getActiveParentKeys = (menus, pathname, parentKeys = []) => {
  return menus.reduce((keys, item) => {
    if (item.path === pathname) {
      return [...keys, ...parentKeys]
    }

    if (item.children?.length) {
      return [
        ...keys,
        ...getActiveParentKeys(item.children, pathname, [
          ...parentKeys,
          item.id,
        ]),
      ]
    }

    return keys
  }, [])
}

const hasActiveChild = (item, pathname) => {
  if (item.path === pathname) {
    return true
  }

  return item.children?.some((child) => hasActiveChild(child, pathname))
}

const MOBILE_TAB_CONFIGS = [
  { icon: 'list', label: '明细', path: '/transactions' },
  { icon: 'chart', label: '图表', path: '/chart' },
  { center: true, icon: 'plus', label: '记账', path: '/transactions' },
  { icon: 'compass', label: '发现', mobileOnly: true, path: '/discover' },
  { icon: 'user', label: '我的', mobileOnly: true, path: '/profile' },
]

const flattenMenuLeaves = (menus, parentEnabled = true) =>
  menus.reduce((items, item) => {
    const enabled = parentEnabled && item.enabled !== false
    const children = item.children || []

    if (!enabled) {
      return items
    }

    if (children.length) {
      return [...items, ...flattenMenuLeaves(children, enabled)]
    }

    if (!item.path) {
      return items
    }

    return [...items, item]
  }, [])

const getMobileTabItems = (menus) => {
  const leafItems = flattenMenuLeaves(menus)
  const configuredItems = MOBILE_TAB_CONFIGS.map((config) => {
    const sourceItem = leafItems.find((item) => item.path === config.path)

    if (!sourceItem && !config.mobileOnly) {
      return null
    }

    return {
      ...(sourceItem || {}),
      id:
        config.id ||
        (config.center && sourceItem
          ? `${sourceItem.id}-mobile-record`
          : sourceItem?.id) ||
        config.path.replace(/^\//, '').replace(/\//g, '-') ||
        'home',
      icon: config.icon || sourceItem?.icon || 'app',
      isCenter: Boolean(config.center),
      title: config.label,
      path: config.path,
    }
  }).filter(Boolean)
  const pickedPaths = new Set(configuredItems.map((item) => item.path))
  const restItems = leafItems.filter((item) => !pickedPaths.has(item.path))

  return [...configuredItems, ...restItems].slice(0, 5)
}

const Sidebar = ({
  collapsed,
  menus = [],
  onNavigate = () => {},
  onRecordClick = () => {},
  onToggle,
}) => {
  const location = useLocation()
  const [openKeys, setOpenKeys] = React.useState(() => new Set(['category-tags']))
  const mobileTabItems = React.useMemo(() => getMobileTabItems(menus), [menus])

  React.useEffect(() => {
    const activeKeys = getActiveParentKeys(menus, location.pathname)

    if (!activeKeys.length) {
      return
    }

    setOpenKeys((keys) => new Set([...keys, ...activeKeys]))
  }, [menus, location.pathname])

  const toggleOpen = (id) => {
    setOpenKeys((keys) => {
      const nextKeys = new Set(keys)

      if (nextKeys.has(id)) {
        nextKeys.delete(id)
      } else {
        nextKeys.add(id)
      }

      return nextKeys
    })
  }

  const handleRecordClick = () => {
    onNavigate()
    onRecordClick()
  }

  const renderMenuItem = (item, depth = 0, parentEnabled = true) => {
    const children = item.children || []
    const enabled = parentEnabled && item.enabled !== false
    const isGroup = children.length > 0
    const isOpen = openKeys.has(item.id)
    const isActive = hasActiveChild(item, location.pathname)
    const depthClass = `depth-${Math.min(depth, 2)}`

    if (isGroup) {
      return (
        <div className="nav-group" key={item.id}>
          <button
            className={[
              'nav-group-trigger',
              depthClass,
              isActive ? 'active' : '',
              !enabled ? 'disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={!enabled}
            onClick={() => toggleOpen(item.id)}
            title={item.title}
            type="button"
          >
            <span className="nav-icon">{renderMenuIcon(item.icon)}</span>
            <span className="nav-label">{item.title}</span>
            <span className="nav-group-arrow">
              {isOpen ? <DownOutlined /> : <RightOutlined />}
            </span>
          </button>
          {isOpen && (
            <div className="nav-children">
              {children.map((child) => renderMenuItem(child, depth + 1, enabled))}
            </div>
          )}
        </div>
      )
    }

    if (!enabled) {
      return (
        <div
          aria-disabled="true"
          className={['nav-item', depthClass, 'disabled'].join(' ')}
          key={item.id}
          title={`${item.title}（已禁用）`}
        >
          <span className="nav-icon">{renderMenuIcon(item.icon)}</span>
          <span className="nav-label">{item.title}</span>
        </div>
      )
    }

    return (
      <NavLink
        className={({ isActive: linkActive }) =>
          ['nav-item', depthClass, linkActive ? 'active' : '']
            .filter(Boolean)
            .join(' ')
        }
        end={item.path === '/'}
        key={item.id}
        onClick={onNavigate}
        title={item.title}
        to={item.path || '/'}
      >
        <span className="nav-icon">{renderMenuIcon(item.icon)}</span>
        <span className="nav-label">{item.title}</span>
      </NavLink>
    )
  }

  const renderMobileTabItem = (item) => {
    if (item.isCenter) {
      return (
        <button
          aria-label={item.title}
          className="mobile-tab-item record"
          key={item.id}
          onClick={handleRecordClick}
          title={item.title}
          type="button"
        >
          <span className="nav-icon">
            <PlusOutlined />
          </span>
        </button>
      )
    }

    return (
      <NavLink
        className={({ isActive: linkActive }) =>
          ['mobile-tab-item', linkActive ? 'active' : '']
            .filter(Boolean)
            .join(' ')
        }
        end={item.path === '/'}
        key={item.id}
        onClick={onNavigate}
        title={item.title}
        to={item.path || '/'}
      >
        <span className="nav-icon">{renderMenuIcon(item.icon)}</span>
        <span className="nav-label">{item.title}</span>
      </NavLink>
    )
  }

  return (
    <aside className={collapsed ? 'nav-bar collapsed' : 'nav-bar'}>
      <div className="sidebar-create-wrap">
        <button
          className="sidebar-create"
          onClick={handleRecordClick}
          title="记一笔"
          type="button"
        >
          <PlusOutlined />
          <span>记一笔</span>
        </button>
      </div>
      <nav className="nav-menu" aria-label="后台菜单">
        {menus.map((item) => renderMenuItem(item))}
      </nav>
      <div className="sidebar-footer">
        <button
          aria-label={collapsed ? '展开菜单' : '收起菜单'}
          className="sidebar-toggle"
          onClick={onToggle}
          title={collapsed ? '展开菜单' : '收起菜单'}
          type="button"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
      <nav
        className="mobile-tab-menu"
        aria-label="移动端主菜单"
        style={{
          gridTemplateColumns: `repeat(${Math.max(
            mobileTabItems.length,
            1
          )}, minmax(0, 1fr))`,
        }}
      >
        {mobileTabItems.map((item) => renderMobileTabItem(item))}
      </nav>
    </aside>
  )
}
export default Sidebar
