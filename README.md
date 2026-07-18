# XianyuMoe 服务器门户网站

Minecraft XianyuMoe 1.21.4 服务器官方网站。

## 功能

- 服务器实时状态监控
- 玩家排行榜（在线时长、方块放置、击杀数）
- 服务器公告系统
- 客户端和资源包下载

## 部署到 GitHub Pages

1. 在 GitHub 上创建仓库
2. 将文件推送到仓库
3. 进入 Settings > Pages
4. Source 选择 "Deploy from a branch"，分支选 `main`，目录选 `/ (root)`
5. 保存后等待几分钟即可访问

## 自定义

### 修改服务器地址

编辑 `script.js`，找到 `SERVER_IP` 变量并修改：

```javascript
const SERVER_IP = 'mc.xymoe.online';
const SERVER_PORT = '25565';
```

### 修改公告

编辑 `index.html` 中 `#announcements-list` 部分的 HTML。

### 修改排行榜数据

编辑 `script.js` 中 `rankingsData` 对象。

## 技术栈

- HTML5
- CSS3 (CSS Variables, Grid, Flexbox)
- Vanilla JavaScript
- 无框架依赖，可直接运行
