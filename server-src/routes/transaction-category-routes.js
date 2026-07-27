const {
  getDefaultTransactionCategoryConfig,
  getTransactionCategoryConfig,
  resetTransactionCategoryConfig,
  writeTransactionCategoryConfig,
} = require('../utils/transaction-category-helper')
const {
  sendError,
  sendFail,
  sendSuccess,
} = require('../utils/response-helper')

const setupTransactionCategoryRoutes = (server) => {
  // 获取当前交易分类配置，可通过 type=收入/支出 筛选。
  server.get('/transaction-categories', (req, res) => {
    try {
      const { type } = req.query
      const categories = getTransactionCategoryConfig()
      const filteredCategories = type
        ? categories.filter((item) => item.type === type)
        : categories

      sendSuccess(res, filteredCategories, '查询交易分类成功')
    } catch (error) {
      sendError(res, '查询交易分类失败', error)
    }
  })

  // 获取默认交易分类配置。
  server.get('/transaction-categories/default', (req, res) => {
    try {
      sendSuccess(
        res,
        getDefaultTransactionCategoryConfig(),
        '查询默认交易分类成功'
      )
    } catch (error) {
      sendError(res, '查询默认交易分类失败', error)
    }
  })

  // 保存交易分类配置。
  server.put('/transaction-categories', (req, res) => {
    try {
      const categories = req.body

      if (!Array.isArray(categories)) {
        return sendFail(res, '交易分类数据必须是数组')
      }

      sendSuccess(
        res,
        writeTransactionCategoryConfig(categories),
        '交易分类保存成功'
      )
    } catch (error) {
      sendError(res, '交易分类保存失败', error)
    }
  })

  // 将交易分类恢复为默认配置。
  server.post('/transaction-categories/reset', (req, res) => {
    try {
      sendSuccess(res, resetTransactionCategoryConfig(), '交易分类已恢复默认')
    } catch (error) {
      sendError(res, '恢复默认交易分类失败', error)
    }
  })
}

module.exports = { setupTransactionCategoryRoutes }
