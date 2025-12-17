const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  // 配置第一个代理：匹配以 /api 开头的请求
  app.use(
    '/api', // 前端请求路径前缀
    createProxyMiddleware({
      target: 'http://localhost:5001', // 代理目标地址（json-server）
      changeOrigin: true, // 支持跨域
      pathRewrite: { '^/api': '' }, // 去掉请求路径中的 /api 前缀
    })
  )

  // 可添加多个代理（如其他后端接口）
  // app.use(
  //   '/other-api',
  //   createProxyMiddleware({
  //     target: 'http://localhost:6000',
  //     changeOrigin: true
  //   })
  // );
}
