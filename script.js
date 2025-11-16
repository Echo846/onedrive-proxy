// script.js
document.addEventListener('DOMContentLoaded', () => {
    const fileGrid = document.getElementById('file-grid');
    const loading = document.getElementById('loading');
    
    // 获取文件列表
    async function fetchFiles() {
        try {
            loading.style.display = 'block';
            const response = await fetch('/api/files');
            const data = await response.json();
            
            loading.style.display = 'none';
            
            if (data.value && Array.isArray(data.value)) {
                renderFiles(data.value);
            } else {
                fileGrid.innerHTML = '<div class="file-item error">无法加载文件</div>';
            }
        } catch (error) {
            loading.style.display = 'none';
            fileGrid.innerHTML = `<div class="file-item error">错误: ${error.message}</div>`;
            console.error('获取文件失败:', error);
        }
    }

    // 渲染文件列表
    function renderFiles(files) {
        if (files.length === 0) {
            fileGrid.innerHTML = '<div class="file-item empty">没有文件</div>';
            return;
        }

        fileGrid.innerHTML = '';
        
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';
            
            // 根据文件类型选择图标
            const icon = file.folder ? '📁' : '📄';
            
            item.innerHTML = `
                <div class="file-icon">${icon}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                    ${formatSize(file.size)}
                </div>
            `;
            
            // 添加点击事件
            item.addEventListener('click', () => {
                if (file.folder) {
                    alert('打开文件夹: ' + file.name);
                } else {
                    // 下载文件
                    window.open(`/api/download?path=/${encodeURIComponent(file.name)}`);
                }
            });
            
            fileGrid.appendChild(item);
        });
    }

    // 格式化文件大小
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 初始化加载
    fetchFiles();
});