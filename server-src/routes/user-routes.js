const {
  getSafeUserConfig,
  resetUserConfig,
  verifyUserLogin,
  writeUserConfig,
} = require('../utils/user-helper')
const {
  sendError,
  sendFail,
  sendResponse,
  sendSuccess,
} = require('../utils/response-helper')

const setupUserRoutes = (server) => {
  // 校验用户登录账号和密码。
  server.post('/login', (req, res) => {
    try {
      const user = verifyUserLogin(req.body?.username, req.body?.password)

      if (!user) {
        return sendResponse(res, {
          code: 401,
          data: null,
          msg: '账号或密码错误',
          status: 200,
        })
      }

      sendSuccess(res, user, '登录成功')
    } catch (error) {
      sendError(res, '登录失败', error)
    }
  })

  // 获取用户账号配置列表，不返回密码哈希、盐或明文密码字段。
  server.get('/users', (req, res) => {
    try {
      sendSuccess(res, getSafeUserConfig(), '查询用户成功')
    } catch (error) {
      sendError(res, '查询用户失败', error)
    }
  })

  // 保存用户账号、密码、启用状态和角色绑定配置。
  server.put('/users', (req, res) => {
    try {
      const users = req.body

      if (!Array.isArray(users)) {
        return sendFail(res, '用户数据必须是数组')
      }

      sendSuccess(res, writeUserConfig(users), '用户保存成功')
    } catch (error) {
      sendError(res, '用户保存失败', error)
    }
  })

  // 将用户配置恢复为默认配置。
  server.post('/users/reset', (req, res) => {
    try {
      sendSuccess(res, resetUserConfig(), '用户已恢复默认')
    } catch (error) {
      sendError(res, '恢复默认用户失败', error)
    }
  })
}

module.exports = { setupUserRoutes }
