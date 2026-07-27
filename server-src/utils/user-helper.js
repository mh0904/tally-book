const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const USER_DATA_DIR = path.join(__dirname, '../user-files')
const USER_FILE = path.join(USER_DATA_DIR, 'user-config.json')
const DEFAULT_USER_FILE = path.join(USER_DATA_DIR, 'default-user-config.json')

const ADMIN_USER = {
  id: 'admin',
  username: 'admin',
  name: '管理员',
  roleId: 'admin',
  enabled: true,
  sort: 1,
  passwordSalt: 'tally-book-admin-salt',
  passwordHash:
    'e88b1e038195646a1ccc375e65bdf92fd0d122db79f0530bb398a28f77766bf9',
  builtin: true,
}

const sortUsers = (users = []) =>
  [...users].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))

const createPasswordSalt = () => crypto.randomBytes(16).toString('hex')

const hashPassword = (password, salt) =>
  crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')

const createPasswordFields = (password) => {
  const salt = createPasswordSalt()

  return {
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
  }
}

const sanitizeUser = (user) => {
  const { passwordHash, passwordSalt, password, ...safeUser } = user
  return safeUser
}

const sanitizeUsers = (users = []) => users.map(sanitizeUser)

const getExistingUser = (existingUsers, item) => {
  return existingUsers.find(
    (user) =>
      user.id === item.id ||
      user.username?.toLowerCase() === item.username?.toLowerCase()
  )
}

const normalizeUser = (item, fallbackIndex, existingUsers = []) => {
  const username = String(item.username || '').trim()

  if (!username) {
    throw new Error('用户账号不能为空')
  }

  const isAdmin = item.id === ADMIN_USER.id || username === ADMIN_USER.username
  const existingUser = getExistingUser(existingUsers, item) || {}
  const id = isAdmin ? ADMIN_USER.id : item.id || `user-${Date.now()}-${fallbackIndex}`
  let passwordFields = null

  if (item.password) {
    passwordFields = createPasswordFields(String(item.password))
  } else if (existingUser.passwordSalt && existingUser.passwordHash) {
    passwordFields = {
      passwordSalt: existingUser.passwordSalt,
      passwordHash: existingUser.passwordHash,
    }
  } else if (item.passwordSalt && item.passwordHash) {
    passwordFields = {
      passwordSalt: item.passwordSalt,
      passwordHash: item.passwordHash,
    }
  } else if (isAdmin) {
    passwordFields = {
      passwordSalt: ADMIN_USER.passwordSalt,
      passwordHash: ADMIN_USER.passwordHash,
    }
  } else {
    throw new Error(`用户 ${username} 必须设置登录密码`)
  }

  return {
    id,
    username: isAdmin ? ADMIN_USER.username : username,
    name: String(item.name || username).trim(),
    roleId: isAdmin ? ADMIN_USER.roleId : item.roleId || 'viewer',
    enabled: isAdmin ? true : item.enabled !== false,
    sort: Number(item.sort || fallbackIndex + 1),
    ...passwordFields,
    builtin: Boolean(item.builtin || isAdmin),
  }
}

const ensureAdminUser = (users, existingUsers = []) => {
  const normalizedUsers = users.map((item, index) =>
    normalizeUser(item, index, existingUsers)
  )
  const hasAdmin = normalizedUsers.some((item) => item.id === ADMIN_USER.id)

  if (hasAdmin) {
    return normalizedUsers.map((item) =>
      item.id === ADMIN_USER.id
        ? normalizeUser({ ...ADMIN_USER, ...item }, 0, existingUsers)
        : item
    )
  }

  return [normalizeUser(ADMIN_USER, 0, existingUsers), ...normalizedUsers]
}

const ensureUniqueUsernames = (users) => {
  const seenNames = new Set()

  users.forEach((user) => {
    const normalizedName = user.username.toLowerCase()

    if (seenNames.has(normalizedName)) {
      throw new Error(`账号 ${user.username} 已存在`)
    }

    seenNames.add(normalizedName)
  })
}

const normalizeUserConfig = (users, existingUsers = []) => {
  if (!Array.isArray(users)) {
    return getDefaultUserConfig()
  }

  const normalizedUsers = sortUsers(ensureAdminUser(users, existingUsers))
  ensureUniqueUsernames(normalizedUsers)
  return normalizedUsers
}

const readUserJson = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(data)
}

const getDefaultUserConfig = () => {
  return normalizeUserConfig(readUserJson(DEFAULT_USER_FILE), [])
}

const ensureUserDir = () => {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true })
  }
}

const ensureUserFile = () => {
  ensureUserDir()

  if (!fs.existsSync(USER_FILE)) {
    fs.writeFileSync(
      USER_FILE,
      JSON.stringify(getDefaultUserConfig(), null, 2),
      'utf8'
    )
  }
}

const getRawUserConfig = () => {
  ensureUserFile()
  return normalizeUserConfig(readUserJson(USER_FILE), readUserJson(USER_FILE))
}

const getUserConfig = () => getRawUserConfig()

const getSafeUserConfig = () => sanitizeUsers(getUserConfig())

const writeUserConfig = (users) => {
  ensureUserDir()
  const existingUsers = fs.existsSync(USER_FILE) ? readUserJson(USER_FILE) : []
  const normalizedUsers = normalizeUserConfig(users, existingUsers)
  fs.writeFileSync(USER_FILE, JSON.stringify(normalizedUsers, null, 2), 'utf8')
  return sanitizeUsers(normalizedUsers)
}

const resetUserConfig = () => {
  return writeUserConfig(getDefaultUserConfig())
}

const verifyUserLogin = (username, password) => {
  const normalizedUsername = String(username || '').trim().toLowerCase()
  const currentPassword = String(password || '')

  if (!normalizedUsername || !currentPassword) {
    return null
  }

  const user = getUserConfig().find(
    (item) => item.username.toLowerCase() === normalizedUsername
  )

  if (!user || user.enabled === false) {
    return null
  }

  const passwordHash = hashPassword(currentPassword, user.passwordSalt)

  if (passwordHash !== user.passwordHash) {
    return null
  }

  return sanitizeUser(user)
}

module.exports = {
  getSafeUserConfig,
  getUserConfig,
  resetUserConfig,
  verifyUserLogin,
  writeUserConfig,
}
