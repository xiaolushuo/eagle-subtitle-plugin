/**
 * 字幕同步器
 * 负责字幕的时间同步和显示控制
 */
class SubtitleSync {
    constructor() {
        this.subtitles = [];
        this.currentIndex = -1;
        this.isPlaying = false;
        this.currentTime = 0;
        this.syncInterval = null;
        this.onSubtitleChange = null;
        this.lastUpdateTime = 0;
        this.updateInterval = 50; // 更新间隔（毫秒）
        this.performanceMode = true; // 性能模式
    }
    
    // 加载字幕
    loadSubtitles(subtitles) {
        if (!Array.isArray(subtitles)) {
            throw new Error('字幕必须是数组格式');
        }
        
        // 按开始时间排序
        this.subtitles = subtitles.sort((a, b) => a.startTime - b.startTime);
        this.currentIndex = -1;
        this.currentTime = 0;
        this.lastUpdateTime = 0;
        
        console.log(`📝 已加载 ${this.subtitles.length} 条字幕到同步器`);
        
        // 验证字幕数据
        this.validateSubtitles();
        
        // 如果字幕数量很多，启用性能模式
        if (this.subtitles.length > 1000) {
            this.performanceMode = true;
            this.updateInterval = 100;
            console.log('⚡ 启用性能模式');
        }
    }
    
    // 验证字幕数据
    validateSubtitles() {
        let warningCount = 0;
        
        for (let i = 0; i < this.subtitles.length; i++) {
            const subtitle = this.subtitles[i];
            
            if (typeof subtitle.startTime !== 'number' || typeof subtitle.endTime !== 'number') {
                console.warn(`⚠️ 字幕 ${i} 时间格式错误`);
                warningCount++;
            }
            
            if (subtitle.startTime >= subtitle.endTime) {
                console.warn(`⚠️ 字幕 ${i} 开始时间大于等于结束时间`);
                warningCount++;
            }
            
            if (subtitle.startTime < 0) {
                console.warn(`⚠️ 字幕 ${i} 开始时间为负数`);
                warningCount++;
            }
            
            if (!subtitle.text || subtitle.text.trim() === '') {
                console.warn(`⚠️ 字幕 ${i} 文本为空`);
                warningCount++;
            }
        }
        
        if (warningCount > 0) {
            console.log(`🔍 字幕验证完成，发现 ${warningCount} 个警告`);
        }
    }
    
    // 开始同步
    startSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.isPlaying = true;
        this.lastUpdateTime = Date.now();
        
        this.syncInterval = setInterval(() => {
            this.updateSubtitle();
        }, this.updateInterval);
        
        console.log('▶️ 字幕同步已开始');
    }
    
    // 停止同步
    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        this.isPlaying = false;
        console.log('⏸️ 字幕同步已停止');
    }
    
    // 设置当前时间
    setCurrentTime(time) {
        if (typeof time !== 'number' || time < 0) {
            console.warn('⚠️ 无效的时间值:', time);
            return;
        }
        
        this.currentTime = time;
        
        // 如果正在播放，立即更新字幕
        if (this.isPlaying) {
            this.updateSubtitle();
        }
    }
    
    // 更新字幕显示
    updateSubtitle() {
        const now = Date.now();
        
        // 限制更新频率
        if (now - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        
        this.lastUpdateTime = now;
        
        // 查找当前时间对应的字幕
        const newSubtitle = this.findSubtitleForTime(this.currentTime);
        
        // 如果字幕有变化，触发回调
        if (newSubtitle !== this.currentIndex) {
            this.currentIndex = newSubtitle;
            
            if (this.onSubtitleChange) {
                const subtitle = this.currentIndex >= 0 ? this.subtitles[this.currentIndex] : null;
                this.onSubtitleChange(subtitle);
            }
        }
    }
    
    // 查找当前时间对应的字幕
    findSubtitleForTime(time) {
        // 如果没有字幕，返回 -1
        if (this.subtitles.length === 0) {
            return -1;
        }
        
        // 使用二分查找提高性能
        let left = 0;
        let right = this.subtitles.length - 1;
        let result = -1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const subtitle = this.subtitles[mid];
            
            if (time >= subtitle.startTime && time <= subtitle.endTime) {
                result = mid;
                break;
            } else if (time < subtitle.startTime) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        return result;
    }
    
    // 获取当前字幕
    getCurrentSubtitle() {
        if (this.currentIndex >= 0 && this.currentIndex < this.subtitles.length) {
            return this.subtitles[this.currentIndex];
        }
        return null;
    }
    
    // 跳转到指定时间
    seekTo(time) {
        this.setCurrentTime(time);
        console.log(`⏩ 跳转到时间: ${this.formatTime(time)}`);
    }
    
    // 调整字幕时间偏移
    adjustOffset(offset) {
        if (typeof offset !== 'number') {
            console.warn('⚠️ 无效的偏移值:', offset);
            return;
        }
        
        this.subtitles.forEach(subtitle => {
            subtitle.startTime += offset;
            subtitle.endTime += offset;
        });
        
        // 重新排序
        this.subtitles.sort((a, b) => a.startTime - b.endTime);
        
        console.log(`⏰ 字幕时间偏移已调整: ${offset}秒`);
    }
    
    // 获取下一个字幕
    getNextSubtitle() {
        if (this.currentIndex < this.subtitles.length - 1) {
            return this.subtitles[this.currentIndex + 1];
        }
        return null;
    }
    
    // 获取上一个字幕
    getPreviousSubtitle() {
        if (this.currentIndex > 0) {
            return this.subtitles[this.currentIndex - 1];
        }
        return null;
    }
    
    // 获取指定时间范围内的字幕
    getSubtitlesInRange(startTime, endTime) {
        return this.subtitles.filter(subtitle => {
            return subtitle.startTime <= endTime && subtitle.endTime >= startTime;
        });
    }
    
    // 格式化时间显示
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    // 获取同步状态
    getStatus() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            currentIndex: this.currentIndex,
            totalSubtitles: this.subtitles.length,
            currentSubtitle: this.getCurrentSubtitle(),
            updateInterval: this.updateInterval,
            performanceMode: this.performanceMode
        };
    }
    
    // 重置同步器
    reset() {
        this.stopSync();
        this.subtitles = [];
        this.currentIndex = -1;
        this.currentTime = 0;
        this.lastUpdateTime = 0;
        this.performanceMode = true;
        this.updateInterval = 50;
        console.log('🔄 字幕同步器已重置');
    }
    
    // 设置更新间隔
    setUpdateInterval(interval) {
        if (typeof interval === 'number' && interval > 0) {
            this.updateInterval = interval;
            console.log(`⏱️ 更新间隔已设置为: ${interval}ms`);
            
            // 如果正在播放，重新启动同步
            if (this.isPlaying) {
                this.stopSync();
                this.startSync();
            }
        }
    }
    
    // 设置性能模式
    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
        if (enabled) {
            this.updateInterval = 100;
        } else {
            this.updateInterval = 50;
        }
        
        console.log(`⚡ 性能模式: ${enabled ? '启用' : '禁用'}`);
        
        // 如果正在播放，重新启动同步
        if (this.isPlaying) {
            this.stopSync();
            this.startSync();
        }
    }
    
    // 获取统计信息
    getStatistics() {
        const totalDuration = this.subtitles.length > 0 ? 
            this.subtitles[this.subtitles.length - 1].endTime : 0;
        
        const avgDuration = this.subtitles.length > 0 ? 
            this.subtitles.reduce((sum, sub) => sum + (sub.endTime - sub.startTime), 0) / this.subtitles.length : 0;
        
        return {
            totalSubtitles: this.subtitles.length,
            totalDuration: totalDuration,
            averageDuration: avgDuration,
            currentIndex: this.currentIndex,
            progress: totalDuration > 0 ? (this.currentTime / totalDuration) * 100 : 0
        };
    }
}

// 导出同步器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubtitleSync;
}