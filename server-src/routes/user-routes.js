const {
  getSafeUserConfig,
  resetUserConfig,
  verifyUserLogin,
  writeUserConfig,
} = require('../utils/user-helper')

const setupUserRoutes = (server) => {
  server.post('/login', (req, res) => {
    try {
      const user = verifyUserLogin(req.body?.username, req.body?.password)

      if (!user) {
        return res.json({
          code: 401,
          data: null,
          msg: '账号或密码错误',
        })
      }

      res.json({
        code: 200,
        data: user,
        msg: '登录成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `登录失败：${error.message}`,
      })
    }
  })

  server.get('/users', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getSafeUserConfig(),
        msg: '查询用户成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询用户失败：${error.message}`,
      })
    }
  })

  server.put('/users', (req, res) => {
    try {
      const users = req.body

      if (!Array.isArray(users)) {
        return res.status(400).json({
          code: 400,
          data: null,
          msg: '用户数据必须是数组',
        })
      }

      res.json({
        code: 200,
        data: writeUserConfig(users),
        msg: '用户保存成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `用户保存失败：${error.message}`,
      })
    }
  })

  server.post('/users/reset', (req, res) => {
    try {
      res.json({
        code: 200,
        data: resetUserConfig(),
        msg: '用户已恢复默认',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `恢复默认用户失败：${error.message}`,
      })
    }
  })
}

module.exports = { setupUserRoutes }
