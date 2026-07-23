# 斗牛游戏部署与访问指南

## 项目结构

```
douniu/
├── miniprogram/              # 微信小程序前端
│   ├── api/                  # API 调用层
│   ├── pages/                # 页面 (index 主页 / card_game 游戏页)
│   ├── components/           # 组件 (room-modal / rules-modal / dialog)
│   ├── utils/                # 工具 (request / socketService / gameLogic)
│   ├── config.ts             # 后端地址配置
│   ├── app.ts                # 小程序入口
│   └── app.json              # 路由配置
├── server/                   # Node.js 后端 (新增)
│   ├── src/
│   │   ├── index.ts          # 入口 (Express + Socket.IO)
│   │   ├── routes/           # HTTP 路由
│   │   ├── services/         # 业务逻辑 (roomManager / gameLogic)
│   │   └── types/            # 类型定义
│   ├── package.json
│   └── tsconfig.json
└── DEPLOY.md                 # 本文档
```

## 一、后端服务部署

### 方案 A：本地开发（局域网联机调试）

适合开发阶段，多台设备在同一 WiFi 下联机。

1. **启动后端**
   ```bash
   cd server
   npm install
   npm run dev    # 热重载
   # 或 npm start (生产模式)
   ```

2. **获取本机 IP**
   ```bash
   # Windows
   ipconfig
   
   # 找到 IPv4 地址，类似 192.168.1.100
   ```

3. **修改前端配置**
   
   编辑 `miniprogram/config.ts`：
   ```typescript
   export const API_BASE_URL = 'http://192.168.1.100:3000';
   export const WS_BASE_URL  = 'ws://192.168.1.100:3000';
   ```

4. **微信开发者工具配置合法域名**
   - 详情 → 本地设置 → 勾选 "不校验合法域名、web-view (业务域名)、TLS 版本以及 HTTPS 证书"
   - 否则小程序会拒绝 HTTP 请求

### 方案 B：云服务器部署（推荐正式环境）

适合上线 / 远程联机。

#### 选项 B1：腾讯云轻量 (轻量应用服务器)

```bash
# 1. 购买轻量服务器 (2核2G 足够, ¥50/月 左右)
# 2. 选择 Node.js 14+ 镜像或 Ubuntu
# 3. SSH 登录
ssh root@<your-server-ip>

# 4. 安装 Node.js (如果没有)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# 5. 上传项目 (用 scp / git clone)
git clone <your-repo> /opt/douniu
cd /opt/douniu/server
npm install
npm run build

# 6. 用 PM2 守护进程
npm install -g pm2
pm2 start dist/index.js --name douniu-server
pm2 save
pm2 startup

# 7. 开放 3000 端口 (腾讯云控制台防火墙)
# 安全组 → 添加规则: TCP 3000
```

#### 选项 B2：Docker 部署

创建 `server/Dockerfile`：
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```bash
# 构建镜像
npm run build
docker build -t douniu-server .

# 运行容器
docker run -d -p 3000:3000 --restart=always --name douniu douniu-server
```

### 方案 C：Serverless 部署（最低成本）

适合早期试水 / 演示。

- **腾讯云 CloudBase**: 支持 Node.js, 按调用付费
- **Vercel**: 适合 HTTP, WebSocket 需要用 Vercel 的 serverless functions
- **Railway / Render**: 免费额度支持 Socket.IO

## 二、HTTPS + WSS（生产必须）

微信小程序只允许 HTTPS 请求，WebSocket 必须用 WSS。

### 用 Nginx 反向代理 + Let's Encrypt 免费证书

```nginx
# /etc/nginx/sites-available/douniu
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # HTTP API
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}

# 80 端口跳转
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

```bash
# 申请免费证书
apt install certbot python3-certbot-nginx
certbot --nginx -d api.yourdomain.com

# 测试 + 重载
nginx -t && systemctl reload nginx
```

## 三、修改前端配置

拿到正式域名后，编辑 `miniprogram/config.ts`：

```typescript
export const API_BASE_URL = 'https://api.yourdomain.com';
export const WS_BASE_URL  = 'wss://api.yourdomain.com';
export const USE_MOCK     = false;  // 切到真实后端
```

## 四、微信小程序后台配置

1. **登录 mp.weixin.qq.com**
2. **开发 → 开发管理 → 开发设置 → 服务器域名**
3. 添加：
   - `request 合法域名`: `https://api.yourdomain.com`
   - `socket 合法域名`: `wss://api.yourdomain.com`
4. **保存**

> 注意：每次修改后需要在小程序开发者工具里 **重启** 或 **清缓存** 才生效。

## 五、发布流程

1. 微信开发者工具 → 右上角 **上传**
2. mp.weixin.qq.com → 版本管理 → 提交审核
3. 审核通过后 → 发布

## 六、测试访问

### 本地测试
- 启动后端: `cd server && npm run dev`
- 微信开发者工具: 导入 `miniprogram/` 目录, 自动编译运行
- 真机调试: 详情 → 真机调试 → 用微信扫码

### 局域网联机 (多设备)
1. 手机和电脑在同一 WiFi
2. 后端跑在电脑上 (端口 3000)
3. `config.ts` 改成电脑局域网 IP
4. 小程序走 "真机调试" 或体验版

### 远程测试
- 部署到云服务器
- 申请 HTTPS 证书
- 配置 `config.ts` 指向正式域名
- 在微信小程序后台添加合法域名

## 七、常见问题

### 1. `request:fail url not in domain list`
微信开发者工具 → 详情 → 本地设置 → 勾选 "不校验合法域名" (开发用)。
正式上线必须用 HTTPS 域名并在 mp 平台配置。

### 2. WebSocket 连不上
- 确认后端 `/health` 正常
- 浏览器测试: `wscat -c ws://your-domain:3000`
- 检查防火墙/安全组是否放行 3000 端口

### 3. 用户登录获取不到 openid
当前实现是 Mock, 直接用 `code` 作为 openid 标识。
生产环境需要:
1. 后端用 `code + appSecret` 调用微信 `code2Session` 接口
2. 缓存 openid + session_key
3. 返回真实 openid 给前端

参考文档: https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html

### 4. 数据丢失 (服务重启后)
当前用内存 Map, 重启数据清空。
生产建议:
- Redis 存房间/会话 (TTL 2 小时)
- PostgreSQL 存用户/战绩

## 八、监控 (可选)

```bash
# PM2 监控
pm2 monit

# 日志
pm2 logs douniu-server

# 健康检查
curl https://api.yourdomain.com/health
```

部署完成 🚀
