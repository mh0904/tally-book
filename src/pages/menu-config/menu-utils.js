import { sortMenuTree } from '../../config/menu'

export const createMenuId = () =>
  `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const findMenuInfoById = (menus, id, depth = 0, parentId = null) => {
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

export const getAllMenuKeys = (menus) =>
  menus.reduce((keys, item) => {
    return [...keys, item.id, ...getAllMenuKeys(item.children || [])]
  }, [])

export const getNextSort = (menus) => {
  const maxSort = menus.reduce(
    (max, item) => Math.max(max, Number(item.sort || 0)),
    0
  )

  return maxSort + 1
}

export const createMenu = ({ title, sort }) => ({
  id: createMenuId(),
  title,
  icon: 'menu',
  path: '',
  enabled: true,
  sort,
})

export const addMenuToTree = (menus, parentId, nextMenu) => {
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

export const updateMenuInTree = (menus, selectedId, values) =>
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
