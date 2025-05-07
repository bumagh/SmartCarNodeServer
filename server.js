const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 ,host:'0.0.0.0'});

// 设备连接池
const clients = new Map();

wss.on('connection', (ws) => {
    // 设备注册
    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);
            
            if (msg.type === 'register') {
                clients.set(msg.deviceId, ws);
                console.log(`设备 ${msg.deviceId} 已连接`);
            }
            
            // 转发控制指令
            if (msg.type === 'control') {
                const target = clients.get(msg.target);
                if (target) {
                    target.send(JSON.stringify({
                        cmd: msg.command,
                        source: msg.source
                    }));
                }
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