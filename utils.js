/**
 * Eagle 字幕插件工具类
 */
class SubtitleUtils {
    // 获取字幕文件路径
    static getSubtitlePath(videoPath, format = 'auto') {
        const path = require('path');
        const fs = require('fs');
        
        const videoDir = path.dirname(videoPath);
        const videoName = path.basename(videoPath, path.extname(videoPath));
        
        // 支持的字幕格式
        const formats = format === 'auto' ? ['srt', 'ass', 'vtt'] : [format];
        
        for (const ext of formats) {
            const subtitlePath = path.join(videoDir, `${videoName}.${ext}`);
            if (fs.existsSync(subtitlePath)) {
                return subtitlePath;
            }
        }
        
        return null;
    }
    
    // 格式化时间显示
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    // 显示通知
    static showNotification(message, duration = 3000) {
        console.log('📢', message);
        
        // 如果在 Eagle 环境中，使用 Eagle 的通知系统
        if (typeof eagle !== 'undefined' && eagle.notification) {
            eagle.notification.show(message, duration);
        }
    }
    
    // 验证文件是否存在
    static fileExists(filePath) {
        try {
            const fs = require('fs');
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }
    
    // 读取文件内容
    static readFile(filePath, encoding = 'utf8') {
        try {
            const fs = require('fs');
            return fs.readFileSync(filePath, encoding);
        } catch (error) {
            console.error('❌ 读取文件失败:', error);
            return null;
        }
    }
    
    // 获取文件扩展名
    static getFileExtension(filePath) {
        const path = require('path');
        return path.extname(filePath).toLowerCase().substring(1);
    }
    
    // 检查是否为视频文件
    static isVideoFile(fileName) {
        const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'];
        const ext = this.getFileExtension(fileName);
        return videoExtensions.includes(ext);
    }
    
    // 检查是否为字幕文件
    static isSubtitleFile(fileName) {
        const subtitleExtensions = ['srt', 'ass', 'ssa', 'vtt', 'sub'];
        const ext = this.getFileExtension(fileName);
        return subtitleExtensions.includes(ext);
    }
    
    // 深拷贝对象
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }
    
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubtitleUtils;
}