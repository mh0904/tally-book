const {
  getDefaultTransactionCategoryConfig,
  getTransactionCategoryConfig,
  resetTransactionCategoryConfig,
  writeTransactionCategoryConfig,
} = require('../utils/transaction-category-helper')

const setupTransactionCategoryRoutes = (server) => {
  // 获取当前交易分类配置。
  server.get('/transaction-categories', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getTransactionCategoryConfig(),
        msg: '查询交易分类成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询交易分类失败：${error.message}`,
      })
    }
  })

  // 获取默认交易分类配置。
  server.get('/transaction-categories/default', (req, res) => {
    try {
      res.json({
        code: 200,
        data: getDefaultTransactionCategoryConfig(),
        msg: '查询默认交易分类成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `查询默认交易分类失败：${error.message}`,
      })
    }
  })

  // 保存交易分类配置。
  server.put('/transaction-categories', (req, res) => {
    try {
      const categories = req.body

      if (!Array.isArray(categories)) {
        return res.status(400).json({
          code: 400,
          data: null,
          msg: '交易分类数据必须是数组',
        })
      }

      res.json({
        code: 200,
        data: writeTransactionCategoryConfig(categories),
        msg: '交易分类保存成功',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `交易分类保存失败：${error.message}`,
      })
    }
  })

  // 将交易分类恢复为默认配置。
  server.post('/transaction-categories/reset', (req, res) => {
    try {
      res.json({
        code: 200,
        data: resetTransactionCategoryConfig(),
        msg: '交易分类已恢复默认',
      })
    } catch (error) {
      res.status(500).json({
        code: 500,
        data: null,
        msg: `恢复默认交易分类失败：${error.message}`,
      })
    }
  })
}

module.exports = { setupTransactionCategoryRoutes }
