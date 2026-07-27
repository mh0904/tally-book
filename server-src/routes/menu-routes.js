const {
  getDefaultMenuConfig,
  getMenuConfig,
  resetMenuConfig,
  writeMenuConfig,
} = require('../utils/menu-helper')

const setupMenuRoutes = (server) => {
  // 获取当前后台菜单树配置。
  server.get('/menus', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getMenuConfig(),
        msg: '查询菜单成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询菜单失败：${error.message}`,
      })
    }
  })

  // 获取默认后台菜单树配置。
  server.get('/menus/default', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getDefaultMenuConfig(),
        msg: '查询默认菜单成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询默认菜单失败：${error.message}`,
      })
    }
  })

  // 保存后台菜单树配置。
  server.put('/menus', (req, res) => {
    try {
      const menus = req.body

      if (!Array.isArray(menus)) {
        return res.status(400).json({
          code: 400,
          data: null,
          msg: '菜单数据必须是数组',
        })
      }

      res.json({
        code: 200,
        data: writeMenuConfig(menus),
        msg: '菜单保存成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `菜单保存失败：${error.message}`,
      })
    }
  })

  // 将后台菜单树恢复为默认配置。
  server.post('/menus/reset', (req, res) => {
    try {
      res.json({
        code: 200,
        data: resetMenuConfig(),
        msg: '菜单已恢复默认',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `恢复默认菜单失败：${error.message}`,
      })
    }
  })
}

module.exports = { setupMenuRoutes }
