const fs = require('fs')
const path = require('path')

const ROLE_DATA_DIR = path.join(__dirname, '../role-files')
const ROLE_FILE = path.join(ROLE_DATA_DIR, 'role-config.json')
const DEFAULT_ROLE_FILE = path.join(ROLE_DATA_DIR, 'default-role-config.json')

const ADMIN_ROLE = {
  id: 'admin',
  name: '管理员',
  description: '拥有全部菜单和系统管理权限',
  enabled: true,
  sort: 1,
  menuIds: ['*'],
  builtin: true,
}

const sortRoles = (roles = []) =>
  [...roles].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

const normalizeMenuIds = (menuIds) => {
  if (!Array.isArray(menuIds)) {
    return []
  }

  return [...new Set(menuIds.filter(Boolean).map(String))]
}

const normalizeRole = (item, fallbackIndex) => {
  const isAdmin = item.id === ADMIN_ROLE.id

  return {
    id: item.id || `role-${Date.now()}-${fallbackIndex}`,
    name: item.name || '未命名角色',
    description: item.description || '',
    enabled: isAdmin ? true : item.enabled !== false,
    sort: Number(item.sort || fallbackIndex + 1),
    menuIds: isAdmin ? ['*'] : normalizeMenuIds(item.menuIds),
    builtin: Boolean(item.builtin || isAdmin),
  }
}

const ensureAdminRole = (roles) => {
  const normalizedRoles = roles.map((item, index) => normalizeRole(item, index))
  const hasAdmin = normalizedRoles.some((item) => item.id === ADMIN_ROLE.id)

  if (hasAdmin) {
    return normalizedRoles.map((item) =>
      item.id === ADMIN_ROLE.id ? normalizeRole({ ...ADMIN_ROLE, ...item }, 0) : item
    )
  }

  return [ADMIN_ROLE, ...normalizedRoles]
}

const normalizeRoleConfig = (roles) => {
  if (!Array.isArray(roles)) {
    return getDefaultRoleConfig()
  }

  return sortRoles(ensureAdminRole(roles))
}

const readRoleJson = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

const getDefaultRoleConfig = () => {
  return normalizeRoleConfig(readRoleJson(DEFAULT_ROLE_FILE))
}

const ensureRoleDir = () => {
  if (!fs.existsSync(ROLE_DATA_DIR)) {
    fs.mkdirSync(ROLE_DATA_DIR, { recursive: true })
  }
}

const ensureRoleFile = () => {
  ensureRoleDir()

  if (!fs.existsSync(ROLE_FILE)) {
    fs.writeFileSync(
      ROLE_FILE,
      JSON.stringify(getDefaultRoleConfig(), null, 2),
      'utf8'
    )
  }
}

const getRoleConfig = () => {
  ensureRoleFile()
  return normalizeRoleConfig(readRoleJson(ROLE_FILE))
}

const writeRoleConfig = (roles) => {
  ensureRoleDir()
  const normalizedRoles = normalizeRoleConfig(roles)
  fs.writeFileSync(ROLE_FILE, JSON.stringify(normalizedRoles, null, 2), 'utf8')
  return normalizedRoles
}

const resetRoleConfig = () => {
  return writeRoleConfig(getDefaultRoleConfig())
}

module.exports = {
  getDefaultRoleConfig,
  getRoleConfig,
  resetRoleConfig,
  writeRoleConfig,
}
