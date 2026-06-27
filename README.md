# 🐱 猫普达 Maopuda

> 一个基于 **Taro 3 + React + TypeScript + 微信云开发** 的猫咪领养 / 送养与吸猫社区小程序。

猫普达旨在为流浪猫咪提供一个温暖的领养与送养平台，同时提供吸猫社区（猫咪卡片、动态、关注、点赞评论）、资讯、消息通知及后台管理等功能，让爱猫人士可以在这里发现、领养、分享与陪伴。

## ✨ 功能特性

- 🏠 **首页门户** —— 轮播图、全局搜索、快捷入口（领养 / 送养 / 吸猫 / 小卖铺 / 公众号）
- 🐾 **领养中心** —— 领养信息流、发布送养、领养详情、按城市/区域筛选
- 💖 **吸猫社区**
  - **猫咪卡片**：发布、关注、动态、详情展示
  - **动态广场**：发布动态、点赞、评论、我的喜欢
- 💬 **消息中心** —— 会话列表、即时对话、系统通知
- 👤 **个人中心** —— 用户资料、我的领养记录
- 📰 **资讯阅读** —— 公众号文章 / 公告阅读
- 🛠️ **后台管理** —— 内容发布、资讯管理、平台设置
- ☁️ **全云端架构** —— 业务逻辑全部由微信云函数承载，免服务器运维

## 🧱 技术栈

| 分类       | 技术                                   |
| ---------- | -------------------------------------- |
| 跨端框架   | [Taro](https://taro.jd.com/) `3.0.23`  |
| UI 框架    | React `16.x` + [taro-ui](https://taro-ui.jd.com/) `3.x` |
| 开发语言   | TypeScript `3.7`                       |
| 样式方案   | Less + PostCSS (pxtransform)           |
| 后端服务   | 微信小程序·云开发（云函数 / 云数据库 / 云存储） |
| 工具库     | lodash                                 |

## 📂 项目结构

```
maopuda/
├── .gitignore
├── README.md
└── taro/                         # 小程序工程根目录
    ├── .npmrc                    # npm 镜像配置
    ├── project.config.json       # 微信开发者工具配置（appid 等）
    ├── sitemap.json
    ├── client/                   # 前端源码（Taro 应用）
    │   ├── config/               # Taro 构建配置（dev / prod）
    │   ├── src/
    │   │   ├── app.config.ts     # 小程序全局配置（页面路由、tabBar 等）
    │   │   ├── assets/           # 静态资源
    │   │   ├── components/       # 通用组件（card / bottom）
    │   │   └── pages/            # 业务页面
    │   │       ├── index/        # 首页 / 搜索
    │   │       ├── adopt/        # 领养：列表 / 发布 / 详情
    │   │       ├── ximao/        # 吸猫：卡片 / 详情 / 发布 / 动态
    │   │       ├── message/      # 消息：会话 / 对话 / 通知
    │   │       ├── me/           # 我的 / 我的领养
    │   │       ├── news/         # 资讯阅读
    │   │       ├── manage/       # 后台管理
    │   │       ├── static/       # 公众号介绍
    │   │       └── login/        # 登录
    │   ├── babel.config.js
    │   ├── tsconfig.json
    │   └── global.d.ts
    └── cloud/                    # 云开发
        └── functions/            # 云函数集合（按职责分类）
            ├── 登录与用户    # login · getUserInfo · updateMobile
            ├── 领养          # adoptOpt · sendAdoptMessage · setAdoptBlack
            ├── 吸猫卡片/动态 # cardOpt · dynamicOpt · videoOpt
            ├── 搜索          # search
            ├── 消息          # queryMessage · queryMyMessage · queryUnreadMessage · queryNotice · sendMessage
            ├── 资讯          # addNews · updateNews · delNews · queryAllNews · queryArticle · queryArticleDetail
            ├── 平台配置      # getConfig · setConfig
            ├── 用户管理      # queryAllUser · setUserBlack
            └── 工具          # getQR（小程序码生成）· changeItemStatus（状态变更 / 权限校验）
```

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) `>= 12`
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（建议稳定版）
- 一个开通了**云开发**的微信小程序账号（需替换为自己的 `AppID`）

### 1. 克隆仓库

```bash
git clone https://github.com/ArimaKana/maopuda.git
cd maopuda
```

### 2. 安装依赖

前端依赖位于 `taro/client` 目录下：

```bash
cd taro/client
npm install
```

> 如遇 `node-sass` 安装失败，项目已通过 `.npmrc` 配置国内镜像，可重试或切换 npm registry。

### 3. 配置小程序 AppID

打开 `taro/project.config.json`，将 `appid` 替换为你自己的小程序 AppID：

```jsonc
{
  "appid": "你的AppID"
}
```

并根据需要在云开发控制台创建对应云环境，在入口文件 `client/src/app.tsx` 中修改云环境 ID：

```ts
Taro.cloud.init({
  env: '你的云环境ID',   // 默认为 'maopuda-sv4uw'，需替换为你自己的环境
  traceUser: true
})
```

### 4. 本地开发

```bash
# 编译为微信小程序（watch 模式）
npm run dev:weapp
```

编译产物输出到 `taro/client/dist/`。

### 5. 用微信开发者工具预览

1. 打开微信开发者工具，导入项目，目录选择 **`taro`**（即 `project.config.json` 所在目录）。
2. 项目会自动识别：
   - 小程序代码：`client/dist/`
   - 云函数：`cloud/functions/`
3. 选择已开通云开发的测试环境，即可在模拟器中预览调试。

### 6. 部署云函数

首次运行需将用到的云函数逐个上传部署：在微信开发者工具中右键 `cloud/functions/` 下的各云函数目录 → **上传并部署：云端安装依赖**。

## 📦 构建发布

```bash
# 微信小程序
npm run build:weapp

# 其他端（按需）
npm run build:swan      # 百度小程序
npm run build:alipay    # 支付宝小程序
npm run build:tt        # 抖音小程序
npm run build:h5        # H5
npm run build:rn        # React Native
```

构建完成后，在微信开发者工具中点击「上传」即可提交体验版 / 审核发布。

## 📄 License

本项目基于 [MIT](LICENSE) 协议开源，仅供学习交流使用。

---

<p align="center">愿每一只流浪猫咪都能找到温暖的家 🏡</p>
