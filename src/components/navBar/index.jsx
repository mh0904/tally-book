// src/components/Navbar.js
import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { renderMenuIcon } from '../../common/menuIcons'
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

const Navbar = ({ collapsed, menus = [], onToggle }) => {
  const location = useLocation()
  const [openKeys, setOpenKeys] = React.useState(() => new Set(['business']))

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
      <div className="brand">
        <div className="brand-mark">T</div>
        <div className="brand-info">
          <div className="brand-title">Tally Book</div>
          <div className="brand-subtitle">账本后台</div>
        </div>
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
      <nav className="nav-menu">{menus.map((item) => renderMenuItem(item))}</nav>
    </aside>
  )
}
export default Navbar
