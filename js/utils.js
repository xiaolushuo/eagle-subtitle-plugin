/**
 * Eagle Subtitle Plugin - Utilities
 * Utility functions for the subtitle plugin
 */

// Make utilities available globally
window.SubtitleUtils = {
    /**
     * Get subtitle file path
     */
    getSubtitlePath: function(videoPath, format = 'auto') {
        const path = this.getPath();
        const fs = this.getFS();
        
        if (!path || !fs) {
            console.warn('⚠️ Path or FS module not available');
            return null;
        }
        
        const videoDir = path.dirname(videoPath);
        const videoName = path.basename(videoPath, path.extname(videoPath));
        
        // Supported subtitle formats
        const formats = format === 'auto' ? ['srt', 'ass', 'vtt'] : [format];
        
        for (const ext of formats) {
            const subtitlePath = path.join(videoDir, `${videoName}.${ext}`);
            if (this.fileExists(subtitlePath)) {
                return subtitlePath;
            }
        }
        
        return null;
    },
    
    /**
     * Format time display
     */
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    },
    
    /**
     * Show notification
     */
    showNotification: function(message, duration = 3000) {
        console.log('📢', message);
        
        // Try to use Eagle notification system
        if (typeof eagle !== 'undefined' && eagle.notification) {
            eagle.notification.show(message, duration);
        }
        
        // Fallback to browser notification
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Eagle Subtitle Plugin', {
                body: message,
                icon: 'logo.png'
            });
        }
    },
    
    /**
     * Check if file exists
     */
    fileExists: function(filePath) {
        try {
            const fs = this.getFS();
            return fs.existsSync(filePath);
        } catch (error) {
            console.error('❌ Error checking file existence:', error);
            return false;
        }
    },
    
    /**
     * Read file content
     */
    readFile: function(filePath, encoding = 'utf8') {
        try {
            const fs = this.getFS();
            return fs.readFileSync(filePath, encoding);
        } catch (error) {
            console.error('❌ Error reading file:', error);
            return null;
        }
    },
    
    /**
     * Get file extension
     */
    getFileExtension: function(filePath) {
        const path = this.getPath();
        if (!path) return '';
        return path.extname(filePath).toLowerCase().substring(1);
    },
    
    /**
     * Check if file is video
     */
    isVideoFile: function(fileName) {
        const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'];
        const ext = this.getFileExtension(fileName);
        return videoExtensions.includes(ext);
    },
    
    /**
     * Check if file is subtitle
     */
    isSubtitleFile: function(fileName) {
        const subtitleExtensions = ['srt', 'ass', 'ssa', 'vtt', 'sub'];
        const ext = this.getFileExtension(fileName);
        return subtitleExtensions.includes(ext);
    },
    
    /**
     * Deep clone object
     */
    deepClone: function(obj) {
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
    },
    
    /**
     * Debounce function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Get path module
     */
    getPath: function() {
        if (typeof require !== 'undefined') {
            try {
                return require('path');
            } catch (error) {
                console.warn('⚠️ Path module not available');
                return null;
            }
        }
        return null;
    },
    
    /**
     * Get fs module
     */
    getFS: function() {
        if (typeof require !== 'undefined') {
            try {
                return require('fs');
            } catch (error) {
                console.warn('⚠️ FS module not available');
                return null;
            }
        }
        return null;
    },
    
    /**
     * Get electron module
     */
    getElectron: function() {
        if (typeof require !== 'undefined') {
            try {
                return require('electron');
            } catch (error) {
                console.warn('⚠️ Electron module not available');
                return null;
            }
        }
        return null;
    }
};

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SubtitleUtils;
}