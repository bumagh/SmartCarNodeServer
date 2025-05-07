const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// WebSocket 服务器（保持原端口8080）
const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });
const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            if (msg.type === 'register') {
                clients.set(msg.deviceId, ws);
                console.log(`设备 ${msg.deviceId} 已连接`);
            }
            if (msg.type === 'control') {
                const target = clients.get(msg.target);
                target?.send(JSON.stringify({
                    cmd: msg.command,
                    source: msg.source
                }));
            }
        } catch (e) {
            console.error('消息解析错误:', e);
        }
    });

    ws.on('close', () => {
        clients.forEach((value, key) => {
            if (value === ws) {
                clients.delete(key);
                console.log(`设备 ${key} 断开连接`);
            }
        });
    });
});

// HTTP 服务器（新增8089端口）
const app = express();
const HTTP_PORT = 8089;

// 托管静态文件
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
// 启动HTTP服务器
app.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`控制网页已部署在 http://localhost:${HTTP_PORT}`);
});