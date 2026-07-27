const {
  getDefaultMenuConfig,
  getMenuConfig,
  resetMenuConfig,
  writeMenuConfig,
} = require('../utils/menu-helper')
const { sendError, sendFail, sendSuccess } = require('../utils/response-helper')

const setupMenuRoutes = (server) => {
  // 获取当前后台菜单树配置。
  server.get('/menus', (req, res) => {
    try {
      sendSuccess(res, getMenuConfig(), '查询菜单成功')
    } catch (error) {
      sendError(res, '查询菜单失败', error)
    }
  })

  // 获取默认后台菜单树配置。
  server.get('/menus/default', (req, res) => {
    try {
      sendSuccess(res, getDefaultMenuConfig(), '查询默认菜单成功')
    } catch (error) {
      sendError(res, '查询默认菜单失败', error)
    }
  })

  // 保存后台菜单树配置。
  server.put('/menus', (req, res) => {
    try {
      const menus = req.body
      if (!Array.isArray(menus)) {
        return sendFail(res, '菜单数据必须是数组')
      }
      sendSuccess(res, writeMenuConfig(menus), '菜单保存成功')
    } catch (error) {
      sendError(res, '菜单保存失败', error)
    }
  })

  // 将后台菜单树恢复为默认配置。
  server.post('/menus/reset', (req, res) => {
    try {
      sendSuccess(res, resetMenuConfig(), '菜单已恢复默认')
    } catch (error) {
      sendError(res, '恢复默认菜单失败', error)
    }
  })
}

module.exports = { setupMenuRoutes }
