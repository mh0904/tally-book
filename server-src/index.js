// server-src/index.js
const jsonServer = require('json-server')
const { setupMenuRoutes } = require('./routes/menu-routes')
const { setupRoleRoutes } = require('./routes/role-routes')
const { setupTransactionRoutes } = require('./routes/transaction-routes')

// 创建服务器实例
const server = jsonServer.create()
const middlewares = jsonServer.defaults()

// 启用基础中间件（CORS、JSON解析等）
server.use(middlewares)
server.use(jsonServer.bodyParser)

// 配置业务路由
setupMenuRoutes(server)
setupRoleRoutes(server)
setupTransactionRoutes(server)

// 启动服务器
const PORT = process.env.PORT || 5511
server.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`)
})
