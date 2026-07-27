const fs = require('fs')
const path = require('path')

const MENU_DATA_DIR = path.join(__dirname, '../menu-files')
const MENU_FILE = path.join(MENU_DATA_DIR, 'menu-config.json')
const DEFAULT_MENU_FILE = path.join(MENU_DATA_DIR, 'default-menu-config.json')

const sortMenuTree = (menus = []) =>
  menus
    .map((item) => ({
      ...item,
      children: item.children ? sortMenuTree(item.children) : undefined,
    }))
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

const normalizeMenu = (item, fallbackIndex) => ({
  id: item.id || `menu-${Date.now()}-${fallbackIndex}`,
  title: item.title || '未命名菜单',
  icon: item.icon || 'app',
  path: item.path || '',
  enabled: item.enabled !== false,
  sort: Number(item.sort || fallbackIndex + 1),
  children: Array.isArray(item.children)
    ? item.children.map((child, index) => normalizeMenu(child, index))
    : undefined,
})

const normalizeMenuTree = (menus) => {
  if (!Array.isArray(menus)) {
    return getDefaultMenuConfig()
  }

  return sortMenuTree(menus.map((item, index) => normalizeMenu(item, index)))
}

const readMenuJson = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

const getDefaultMenuConfig = () => {
  return sortMenuTree(readMenuJson(DEFAULT_MENU_FILE))
}

const ensureMenuDir = () => {
  if (!fs.existsSync(MENU_DATA_DIR)) {
    fs.mkdirSync(MENU_DATA_DIR, { recursive: true })
  }
}

const ensureMenuFile = () => {
  ensureMenuDir()

  if (!fs.existsSync(MENU_FILE)) {
    fs.writeFileSync(
      MENU_FILE,
      JSON.stringify(getDefaultMenuConfig(), null, 2),
      'utf8'
    )
  }
}

const getMenuConfig = () => {
  ensureMenuFile()
  return normalizeMenuTree(readMenuJson(MENU_FILE))
}

const writeMenuConfig = (menus) => {
  ensureMenuDir()
  const normalizedMenus = normalizeMenuTree(menus)
  fs.writeFileSync(MENU_FILE, JSON.stringify(normalizedMenus, null, 2), 'utf8')
  return normalizedMenus
}

const resetMenuConfig = () => {
  return writeMenuConfig(getDefaultMenuConfig())
}

module.exports = {
  getDefaultMenuConfig,
  getMenuConfig,
  resetMenuConfig,
  writeMenuConfig,
}
