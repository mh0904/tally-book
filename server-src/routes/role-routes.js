const {
  getDefaultRoleConfig,
  getRoleConfig,
  resetRoleConfig,
  writeRoleConfig,
} = require('../utils/role-helper')

const setupRoleRoutes = (server) => {
  server.get('/roles', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getRoleConfig(),
        msg: '查询角色成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询角色失败：${error.message}`,
      })
    }
  })

  server.get('/roles/default', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getDefaultRoleConfig(),
        msg: '查询默认角色成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询默认角色失败：${error.message}`,
      })
    }
  })

  server.put('/roles', (req, res) => {
    try {
      const roles = req.body

      if (!Array.isArray(roles)) {
        return res.status(400).json({
          code: 400,
          data: null,
          msg: '角色数据必须是数组',
        })
      }

      res.json({
        code: 200,
        data: writeRoleConfig(roles),
        msg: '角色保存成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `角色保存失败：${error.message}`,
      })
    }
  })

  server.post('/roles/reset', (req, res) => {
    try {
      res.json({
        code: 200,
        data: resetRoleConfig(),
        msg: '角色已恢复默认',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `恢复默认角色失败：${error.message}`,
      })
    }
  })
}

module.exports = { setupRoleRoutes }
