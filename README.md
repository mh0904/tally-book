# 记账本应用

## 运行项目
执行以下命令启动整个项目：
```bash
npm start
```

启动后会同时开启两个服务：
- React 前端：访问 http://localhost:3000
- Node.js 后端：访问 http://localhost:5000/transactions 可查看示例数据

## 项目结构
```
tally-book/
├── public/              # React 静态资源
│   └── index.html       # 入口 HTML
├── src/                 # React 源代码
│   ├── components/      # 组件目录
│   ├── constants/       # 常量定义
│   ├── pages/           # 页面组件
│   ├── styles/          # 样式文件
│   ├── utils/           # 工具函数
│   └── index.js         # React 入口文件
├── server-src/          # Node.js 后端代码
│   ├── routes/          # API 路由
│   ├── utils/           # 后端工具函数
│   ├── month-files/     # 月份数据文件
│   └── index.js         # 后端入口文件
├── package.json         # 项目配置
└── README.md            # 项目说明文档
```

