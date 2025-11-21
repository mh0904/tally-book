const CracoLessPlugin = require('craco-less')

let variables = {
  '@background-title': '#f3f4f6', // 主题背景
  '@primary-color': '#6698ff', // 主题色
  '@text-color': '#333', // 文本颜色
  '@border-radius': '4px', // 圆角
  '@font-size-base': '14px', // 基础字号
}

module.exports = {
  // 只有一个 plugins 数组
  plugins: [
    {
      // 插件是一个对象，包含 plugin 和 options 两个属性
      plugin: CracoLessPlugin,
      options: {
        // lessLoaderOptions 是 options 的直接子属性
        lessLoaderOptions: {
          // lessOptions 是 lessLoaderOptions 的直接子属性
          lessOptions: {
            // modifyVars 和 additionalData 都在 lessOptions 里面
            modifyVars: { '@primary-color': '#1DA57A', ...variables },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
}
