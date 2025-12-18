运行项目
执行以下命令启动整个项目：npm start
启动后会同时开启两个服务：
React 前端：访问 http://localhost:3000
json-server 后端：访问 http://localhost:5000/transactions 可查看示例数据

项目结构
tally-book/
├── public/ # React 静态资源
│ └── index.html # 入口 HTML
├── src/ # React 源代码
│ └── index.js # React 入口文件
├── db.json # json-server 数据库文件
├── package.json # 项目配置
