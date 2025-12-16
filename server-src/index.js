// server-src/index.js
const jsonServer = require('json-server')
const { setupTransactionRoutes } = require('./routes/transactionRoutes')

// 创建服务器实例
const server = jsonServer.create()
const middlewares = jsonServer.defaults()

// 启用基础中间件（CORS、JSON解析等）
server.use(middlewares)
server.use(jsonServer.bodyParser)

// 配置交易相关路由
setupTransactionRoutes(server)

// 启动服务器
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`)
})
