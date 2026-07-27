const {
  getDefaultRoleConfig,
  getRoleConfig,
  resetRoleConfig,
  writeRoleConfig,
} = require('../utils/role-helper')
const {
  sendError,
  sendFail,
  sendSuccess,
} = require('../utils/response-helper')

const setupRoleRoutes = (server) => {
  // 获取当前角色和角色菜单权限配置。
  server.get('/roles', (req, res) => {
    try {
      sendSuccess(res, getRoleConfig(), '查询角色成功')
    } catch (error) {
      sendError(res, '查询角色失败', error)
    }
  })

  // 获取默认角色和角色菜单权限配置。
  server.get('/roles/default', (req, res) => {
    try {
      sendSuccess(res, getDefaultRoleConfig(), '查询默认角色成功')
    } catch (error) {
      sendError(res, '查询默认角色失败', error)
    }
  })

  // 保存角色和角色菜单权限配置。
  server.put('/roles', (req, res) => {
    try {
      const roles = req.body
      if (!Array.isArray(roles)) {
        return sendFail(res, '角色数据必须是数组')
      }
      sendSuccess(res, writeRoleConfig(roles), '角色保存成功')
    } catch (error) {
      sendError(res, '角色保存失败', error)
    }
  })

  // 将角色配置恢复为默认配置。
  server.post('/roles/reset', (req, res) => {
    try {
      sendSuccess(res, resetRoleConfig(), '角色已恢复默认')
    } catch (error) {
      sendError(res, '恢复默认角色失败', error)
    }
  })
}

module.exports = { setupRoleRoutes }
