// worker.js
// 多账号配置模板（当前只配置一个账号）
const ONEDRIVE_CONFIGS = {
    "default": {
        client_id: "b1284d60-15b7-4d77-b1ef-28cceda45adb",
        client_secret: "ZBV8Q~zY~KD3MkNUMtjT~wc5wF4w4XJAz5BeVaWD",
        redirect_uri: "https://login.live.com/oauth20_desktop.srf"
    }
    // 添加更多账号时只需扩展：
    // "account2": {
    //     client_id: "另一个ID",
    //     client_secret: "另一个密钥",
    //     redirect_uri: "..."
    // }
};

const ONEDRIVE_API = 'https://graph.microsoft.com/v1.0/me/drive';

async function getAccessToken(account = "default") {
    // 这里需要实现完整的OAuth流程
    // 当前为简化示例，实际需要持久化存储刷新令牌
    const config = ONEDRIVE_CONFIGS[account];
    
    // 实际应通过refresh_token获取新token
    // 此处仅为示例，需替换为真实实现
    return await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: config.client_id,
            scope: 'Files.Read offline_access',
            refresh_token: '保存的刷新令牌',
            grant_type: 'refresh_token',
            client_secret: config.client_secret
        })
    }).then(res => res.json()).then(data => data.access_token);
}

async function handleRequest(request) {
    try {
        const url = new URL(request.url);
        
        // 文件列表接口
        if (url.pathname === '/api/files') {
            const token = await getAccessToken();
            const response = await fetch(`${ONEDRIVE_API}/root/children`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            return new Response(JSON.stringify(await response.json()), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // 文件下载接口
        if (url.pathname === '/api/download') {
            const token = await getAccessToken();
            const path = url.searchParams.get('path') || '/unknown';
            
            // 获取文件下载链接
            const fileMeta = await fetch(`${ONEDRIVE_API}/root:${path}:/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.json());
            
            // 重定向到实际下载地址
            return Response.redirect(fileMeta['@microsoft.graph.downloadUrl'], 302);
        }
        
        // 静态文件服务
        return fetch(request);
    } catch (e) {
        return new Response('错误: ' + e.message, { 
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}

export default {
    fetch: handleRequest
};