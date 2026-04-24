# Game Hub

一个部署在 Cloudflare Workers 上的 React 游戏站点。

当前站点是一个可扩展的小游戏目录，首页展示已经上线的游戏，首个游戏是 `小姐牌`。玩家可以点击翻牌随机抽取牌面，也可以在页面里查看规则、编辑自定义规则，并将自定义内容保存到当前浏览器。

线上地址：

- https://gamehub.hunao.online

## 当前功能

- React + Vite 单页应用
- Cloudflare Workers Static Assets 部署
- 自定义域 `gamehub.hunao.online`
- 显式关闭 `workers.dev`
- 首页游戏目录，只展示已上线游戏
- `小姐牌` 在线随机翻牌
- 移动端适配
- 标题旁弹层查看游戏规则
- 标题旁弹层编辑自定义牌面规则
- 后台接口提供默认规则
- 浏览器本地保存用户自定义规则

## 技术栈

- React 19
- React Router 7
- Vite 7
- TypeScript
- Cloudflare Workers
- Wrangler

## 项目结构

```text
.
├── src/
│   ├── app.tsx                  # 站点首页与路由
│   ├── main.tsx                 # React 入口
│   ├── styles.css               # 全站公共样式
│   └── games/
│       ├── index.ts             # 已上线游戏注册表
│       ├── types.ts             # 游戏类型定义
│       └── maid-card/
│           ├── index.tsx        # 小姐牌页面与交互
│           ├── data.ts          # 默认规则与牌面数据
│           └── styles.css       # 小姐牌专属样式
├── worker/
│   └── index.ts                 # Cloudflare Worker API
├── wrangler.jsonc              # Cloudflare 配置
└── README.md
```

## 本地开发

安装依赖：

```bash
npm install
```

启动前端开发环境：

```bash
npm run dev
```

构建生产资源：

```bash
npm run build
```

使用 Wrangler 本地预览 Cloudflare 版本：

```bash
npm run cf:preview
```

## 部署

发布到 Cloudflare Workers：

```bash
npm run deploy
```

当前 `wrangler.jsonc` 中已经配置了：

- `dist` 作为静态资源目录
- `workers.dev` 关闭
- `gamehub.hunao.online` 自定义域
- SPA 路由回退
- `/api/*` 由 Worker 优先处理

## 小姐牌规则机制

默认规则来源于 Worker API：

- `GET /api/games/maid-card/rules`

前端加载流程如下：

1. 页面打开时先请求后台默认规则。
2. 如果浏览器里已有用户保存过的自定义规则，则优先覆盖显示。
3. 点击 `自定义规则` 后可以逐张编辑牌面文案。
4. 点击 `Save` 后，新的规则会保存到 `localStorage`。
5. 之后翻出的卡牌会使用保存后的文案。
6. 点击 `恢复后台默认` 会清除本地覆盖并恢复后台默认规则。

## 后续扩展

当前结构已经适合继续添加更多游戏。新增游戏时，建议按下面方式扩展：

1. 在 `src/games/` 下创建新的游戏文件夹。
2. 将该游戏的 UI、数据和样式都放在自己的目录内。
3. 在 `src/games/index.ts` 中注册新游戏。
4. 首页会自动从已注册游戏中渲染已上线项目。

## 说明

- 当前“自定义规则”是浏览器本地持久化，不是云端同步。
- 如果后续需要账号同步或多人共享规则，可以继续接入 Cloudflare D1 或 KV。
