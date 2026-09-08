# 考拉记账

考拉记账是一个本地运行的家庭账本后台，用于维护日常收入、支出流水，并提供账单日历、报表统计、收支分类、菜单权限、角色权限和成员账号管理能力。

项目采用前后端同仓结构：

- 前端：React 18 + Vite + Ant Design 5 + Ant Design Charts
- 后端：json-server + Node.js，本地 JSON 文件持久化
- 包管理器：pnpm
- 默认前端端口：`3333`
- 默认后端端口：`5511`

## 功能概览

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 展示系统入口和可访问快捷菜单 |
| 流水 | `/transactions` | 新增、编辑、删除、筛选、批量录入、导入和导出账单 |
| 报表 | `/chart` | 查看支出分类占比和每日支出趋势，金额保留 2 位小数 |
| 账单日历 | `/bill-calendar` | 以日历方式查看每日账单总额，点击日期查看当天明细 |
| 收支分类 | `/category-config` | 维护收入和支出分类、关键词、默认项和启用状态 |
| 菜单配置 | `/menu-config` | 维护后台菜单树、路由地址、图标和启用状态 |
| 角色管理 | `/role-config` | 维护角色资料，并为角色分配可访问菜单范围 |
| 成员管理 | `/user-config` | 管理登录账号、密码、启用状态，并为成员绑定角色 |

## 快速开始

### 环境要求

- Node.js：建议使用 `22.x` 或更新版本
- pnpm：建议使用 `10.x`

### 安装依赖

```bash
pnpm install
```

### 启动开发环境

```bash
pnpm run dev
```

该命令会同时启动两个服务：

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| Vite 前端 | `http://localhost:3333/` | 如果 3333 被占用，Vite 会自动尝试下一个端口 |
| Node 后端 | `http://localhost:5511` | 后端端口固定为 5511 |

前端接口统一使用 `/api` 前缀，Vite 会代理到后端：

```txt
/api/* -> http://localhost:5511/*
```

### 默认登录账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| `admin` | `admin` | 管理员 |

默认管理员拥有全部菜单和系统管理权限。密码使用 `sha256(salt:password)` 方式存储在本地 JSON 文件中。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 同时启动前端 Vite 和后端服务 |
| `pnpm run vite` | 只启动前端服务 |
| `pnpm run server` | 只启动后端服务 |
| `pnpm run build` | 使用 Vite 生成生产构建产物 |
| `pnpm run preview` | 预览生产构建产物 |

## 项目结构

```txt
koala-book/
├── index.html                         # Vite 入口 HTML
├── vite.config.mjs                    # Vite 配置，包含代理和 Less 配置
├── package.json                       # 项目脚本和依赖配置
├── pnpm-lock.yaml                     # pnpm 锁文件
├── src/                               # 前端源码
│   ├── index.jsx                      # React 应用入口
│   ├── index.less                     # 全局样式
│   ├── api/                           # 前端接口封装
│   ├── common/                        # 公共配置和图标映射
│   ├── components/                    # 通用组件
│   ├── config/                        # 菜单、角色、成员、交易分类标准化逻辑
│   ├── constants/                     # 固定字段配置
│   ├── pages/                         # 页面模块
│   │   ├── bill-calendar/             # 账单日历
│   │   ├── category-config/           # 收支分类
│   │   ├── chart/                     # 报表
│   │   ├── home/                      # 首页
│   │   ├── login/                     # 登录页
│   │   ├── menu-config/               # 菜单配置
│   │   ├── role-config/               # 角色管理
│   │   ├── transactions/              # 流水
│   │   └── user-config/               # 成员管理
│   ├── styles/                        # 样式变量
│   └── utils/                         # 前端工具函数
└── server-src/                        # 后端源码和本地数据
    ├── index.js                       # 后端服务入口
    ├── config.js                      # 后端配置
    ├── routes/                        # API 路由
    ├── utils/                         # 后端数据读写和业务工具
    ├── month-files/                   # 按月份保存的账单数据
    ├── menu-files/                    # 菜单配置数据
    ├── role-files/                    # 角色权限配置数据
    ├── user-files/                    # 成员账号配置数据
    └── category-files/                # 交易分类配置数据
```

## 数据存储

后端使用本地 JSON 文件保存数据，不依赖数据库。

| 目录 | 文件 | 说明 |
| --- | --- | --- |
| `server-src/month-files/` | `YYYY-MM.json` | 每个月一份账单数据，例如 `2025-09.json` |
| `server-src/menu-files/` | `menu-config.json` | 当前菜单配置 |
| `server-src/menu-files/` | `default-menu-config.json` | 默认菜单配置 |
| `server-src/role-files/` | `role-config.json` | 当前角色权限配置 |
| `server-src/role-files/` | `default-role-config.json` | 默认角色权限配置 |
| `server-src/user-files/` | `user-config.json` | 当前成员账号配置 |
| `server-src/user-files/` | `default-user-config.json` | 默认成员账号配置 |
| `server-src/category-files/` | `transaction-category-config.json` | 当前交易分类配置 |
| `server-src/category-files/` | `default-transaction-category-config.json` | 默认交易分类配置 |

账单数据结构示例：

```json
{
  "transactions": [
    {
      "id": "1",
      "date": "2025-09-14",
      "type": "支出",
      "classification": "餐饮",
      "amount": 87.76,
      "describe": "午餐",
      "createdAt": 1757808000000
    }
  ]
}
```

## 默认菜单

默认菜单按常用账本入口和配置入口组织。

| 菜单分组 | 子菜单 |
| --- | --- |
| 一级菜单 | 首页、流水、报表、账单日历 |
| 分类标签 | 收支分类、成员管理 |
| 设置 | 菜单配置、角色管理 |

菜单配置支持维护：

- 菜单名称
- 菜单图标
- 路由地址
- 排序
- 启用状态
- 多级菜单树

## 默认角色

| 角色 | 权限范围 |
| --- | --- |
| 管理员 | 全部菜单和系统管理权限 |
| 财务主管 | 首页、流水、报表、账单日历、收支分类 |
| 记账员 | 首页、流水、账单日历、收支分类 |
| 数据分析员 | 首页、报表、账单日历 |
| 只读访客 | 首页、报表 |

管理员角色是内置角色，`menuIds` 为 `["*"]`，表示拥有全部菜单权限。

## 交易分类

交易分类存储在后端，通过接口获取，不再写死在前端。分类按交易类型分为两类：

| 类型 | 默认分类 |
| --- | --- |
| 收入 | 工资、奖金、兼职收入、理财收益、红包收入、报销收入、其他收入 |
| 支出 | 餐饮、购物、交通、住房、水电燃气、通讯网络、医疗健康、教育学习、娱乐休闲、旅行出行、日用百货、服饰美容、数码电器、运动健身、人情礼金、育儿亲子、保险、车辆、订阅会员、办公、维修维护、税费手续费、其他 |

每个分类支持：

- `value`：分类值
- `label`：展示名称
- `type`：收入或支出
- `keywords`：自动分类关键词
- `enabled`：是否启用
- `isDefault`：是否为该类型默认分类
- `sort`：排序值

新增账单时，如果没有传入分类，后端会根据描述和分类关键词自动匹配；匹配不到时使用对应类型的默认分类。

## API 接口

前端请求时使用 `/api` 前缀，例如 `/api/transactions`。后端真实路由不带 `/api`。

### 登录和成员

| 方法 | 前端路径 | 后端路径 | 说明 |
| --- | --- | --- | --- |
| `POST` | `/api/login` | `/login` | 成员登录 |
| `GET` | `/api/users` | `/users` | 获取成员列表，不返回密码哈希和盐 |
| `PUT` | `/api/users` | `/users` | 保存成员账号、密码、启用状态和角色绑定 |
| `POST` | `/api/users/reset` | `/users/reset` | 恢复默认成员配置 |

### 菜单

| 方法 | 前端路径 | 后端路径 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/menus` | `/menus` | 获取当前菜单树 |
| `PUT` | `/api/menus` | `/menus` | 保存菜单树 |
| `POST` | `/api/menus/reset` | `/menus/reset` | 恢复默认菜单配置 |

### 角色

| 方法 | 前端路径 | 后端路径 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/roles` | `/roles` | 获取角色列表和菜单权限 |
| `PUT` | `/api/roles` | `/roles` | 保存角色列表和菜单权限 |
| `POST` | `/api/roles/reset` | `/roles/reset` | 恢复默认角色配置 |

### 交易分类

| 方法 | 前端路径 | 后端路径 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/transaction-categories` | `/transaction-categories` | 获取当前交易分类配置 |
| `GET` | `/api/transaction-categories?type=收入` | `/transaction-categories?type=收入` | 获取收入分类 |
| `GET` | `/api/transaction-categories?type=支出` | `/transaction-categories?type=支出` | 获取支出分类 |
| `PUT` | `/api/transaction-categories` | `/transaction-categories` | 保存交易分类配置 |
| `POST` | `/api/transaction-categories/reset` | `/transaction-categories/reset` | 恢复默认交易分类 |

### 账单流水

| 方法 | 前端路径 | 后端路径 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/transactions` | `/transactions` | 查询账单流水 |
| `POST` | `/api/transactions` | `/transactions` | 新增单条账单 |
| `PUT` | `/api/transactions/:id` | `/transactions/:id` | 更新单条账单，不支持跨月更新 |
| `DELETE` | `/api/transactions/:id` | `/transactions/:id` | 删除单条账单 |
| `POST` | `/api/transactions/batch` | `/transactions/batch` | 批量新增账单 |
| `GET` | `/api/transactions/export` | `/transactions/export` | 导出全部账单数据 |
| `POST` | `/api/transactions/import` | `/transactions/import` | 导入账单数据 |

账单查询支持以下参数：

| 参数 | 示例 | 说明 |
| --- | --- | --- |
| `month` | `2025-09` | 按月份查询，账单日历和报表会使用该参数 |
| `startDate` | `2025-09-01` | 开始日期 |
| `endDate` | `2025-09-30` | 结束日期 |
| `type` | `支出` | 交易类型 |
| `classification` | `餐饮` | 交易分类 |
| `describe` | `咖啡` | 描述关键词，支持模糊匹配 |

## 流水录入说明

流水支持三种录入方式。

| 方式 | 说明 | 示例 |
| --- | --- | --- |
| 单条记录 | 手动填写日期、类型、分类、金额和描述 | `2025-09-14 / 支出 / 餐饮 / 87.76 / 午餐` |
| 单日批量 | 同一天录入多笔账单 | `拼多多9.5元, 牛奶17.8元` |
| 多日批量 | 按月份日期解析多天账单 | `8月1号拼多多9.5元 8月2号吸油棉4.9元` |

导入和导出支持 Excel 文件。导出字段包含 ID、日期、类型、分类、金额和描述。

## 账单日历说明

账单日历按月份加载账单数据：

- 默认选中今天
- 日历顶部支持上一月、今天、下一月切换
- 每一天显示当天账单总额和账单笔数
- 点击日期后，右侧显示当天账单明细
- 右侧明细区域与日历区域等分空间，超出内容显示滚动条

## Vite 构建说明

项目已经从 CRACO/webpack 迁移到 Vite。

当前与构建相关的关键文件：

- `index.html`：Vite 入口 HTML
- `src/index.jsx`：React 入口
- `vite.config.mjs`：Vite 配置、代理配置和 Less 配置

已移除旧构建文件：

- `craco.config.js`
- `webpack.config.js`
- `src/setupProxy.js`
- `public/index.html`

## 常见问题

### 后端启动报错 `EADDRINUSE: address already in use :::5511`

说明 `5511` 端口已经被其他进程占用。可以先查询占用进程：

```powershell
Get-NetTCPConnection -LocalPort 5511 -State Listen
```

如确认是旧的本项目后端进程，可以结束对应 PID：

```powershell
Stop-Process -Id <PID> -Force
```

### 前端 3333 被占用

Vite 默认会自动尝试下一个端口，例如 `3334`。启动日志中会显示实际地址：

```txt
Local: http://localhost:3334/
```

### 登录失败

可以检查：

- 默认账号密码是否为 `admin / admin`
- `server-src/user-files/user-config.json` 中成员是否被禁用
- 成员绑定的角色是否被禁用
- 后端服务 `http://localhost:5511` 是否正常运行

### 接口请求失败

可以检查：

- 前端是否通过 Vite 启动
- 后端是否监听 `5511`
- `vite.config.mjs` 中 `/api` 代理是否存在
- 浏览器控制台和终端日志中的错误信息

## 开发约定

- 新增前端接口请放在 `src/api/`
- 新增页面请放在 `src/pages/`
- 新增后端接口请放在 `server-src/routes/`
- 数据读写逻辑优先放在 `server-src/utils/`
- 业务配置数据优先存储在 `server-src/*-files/`
- 交易分类应通过后端接口维护，不要重新写死到前端常量中
