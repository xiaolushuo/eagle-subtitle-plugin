/**
 * Eagle Subtitle Plugin - Subtitle Sync
 * Handles subtitle timing synchronization and display control
 */

// Make sync available globally
window.SubtitleSync = function() {
    this.subtitles = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.currentTime = 0;
    this.syncInterval = null;
    this.onSubtitleChange = null;
    this.lastUpdateTime = 0;
    this.updateInterval = 50; // Update interval in milliseconds
    this.performanceMode = true; // Performance mode
};

/**
 * Load subtitles
 */
window.SubtitleSync.prototype.loadSubtitles = function(subtitles) {
    if (!Array.isArray(subtitles)) {
        throw new Error('Subtitles must be an array');
    }
    
    // Sort by start time
    this.subtitles = subtitles.sort((a, b) => a.startTime - b.startTime);
    this.currentIndex = -1;
    this.currentTime = 0;
    this.lastUpdateTime = 0;
    
    console.log(`📝 Loaded ${this.subtitles.length} subtitles into sync`);
    
    // Validate subtitle data
    this.validateSubtitles();
};

/**
 * Validate subtitle data
 */
window.SubtitleSync.prototype.validateSubtitles = function() {
    let warningCount = 0;
    
    for (let i = 0; i < this.subtitles.length; i++) {
        const subtitle = this.subtitles[i];
        
        if (typeof subtitle.startTime !== 'number' || typeof subtitle.endTime !== 'number') {
            console.warn(`⚠️ Subtitle ${i} has invalid time format`);
            warningCount++;
        }
        
        if (subtitle.startTime >= subtitle.endTime) {
            console.warn(`⚠️ Subtitle ${i} start time >= end time`);
            warningCount++;
        }
        
        if (subtitle.startTime < 0) {
            console.warn(`⚠️ Subtitle ${i} has negative start time`);
            warningCount++;
        }
        
        if (!subtitle.text || subtitle.text.trim() === '') {
            console.warn(`⚠️ Subtitle ${i} has empty text`);
            warningCount++;
        }
    }
    
    if (warningCount > 0) {
        console.log(`🔍 Subtitle validation complete, found ${warningCount} warnings`);
    }
};

/**
 * Start synchronization
 */
window.SubtitleSync.prototype.startSync = function() {
    if (this.syncInterval) {
        clearInterval(this.syncInterval);
    }
    
    this.isPlaying = true;
    this.lastUpdateTime = Date.now();
    
    this.syncInterval = setInterval(() => {
        this.updateSubtitle();
    }, this.updateInterval);
    
    console.log('▶️ Subtitle synchronization started');
};

/**
 * Stop synchronization
 */
window.SubtitleSync.prototype.stopSync = function() {
    if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
    }
    
    this.isPlaying = false;
    console.log('⏸️ Subtitle synchronization stopped');
};

/**
 * Set current time
 */
window.SubtitleSync.prototype.setCurrentTime = function(time) {
    if (typeof time !== 'number' || time < 0) {
        console.warn('⚠️ Invalid time value:', time);
        return;
    }
    
    this.currentTime = time;
    
    // If playing, update subtitle immediately
    if (this.isPlaying) {
        this.updateSubtitle();
    }
};

/**
 * Update subtitle display
 */
window.SubtitleSync.prototype.updateSubtitle = function() {
    const now = Date.now();
    
    // Limit update frequency
    if (now - this.lastUpdateTime < this.updateInterval) {
        return;
    }
    
    this.lastUpdateTime = now;
    
    // Find subtitle for current time
    const newSubtitle = this.findSubtitleForTime(this.currentTime);
    
    // If subtitle changed, trigger callback
    if (newSubtitle !== this.currentIndex) {
        this.currentIndex = newSubtitle;
        
        if (this.onSubtitleChange) {
            const subtitle = this.currentIndex >= 0 ? this.subtitles[this.currentIndex] : null;
            this.onSubtitleChange(subtitle);
        }
    }
};

/**
 * Find subtitle for current time
 */
window.SubtitleSync.prototype.findSubtitleForTime = function(time) {
    // If no subtitles, return -1
    if (this.subtitles.length === 0) {
        return -1;
    }
    
    // Use binary search for performance
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
};

/**
 * Get current subtitle
 */
window.SubtitleSync.prototype.getCurrentSubtitle = function() {
    if (this.currentIndex >= 0 && this.currentIndex < this.subtitles.length) {
        return this.subtitles[this.currentIndex];
    }
    return null;
};

/**
 * Seek to specific time
 */
window.SubtitleSync.prototype.seekTo = function(time) {
    this.setCurrentTime(time);
    console.log(`⏩ Seek to time: ${this.formatTime(time)}`);
};

/**
 * Adjust subtitle time offset
 */
window.SubtitleSync.prototype.adjustOffset = function(offset) {
    if (typeof offset !== 'number') {
        console.warn('⚠️ Invalid offset value:', offset);
        return;
    }
    
    this.subtitles.forEach(subtitle => {
        subtitle.startTime += offset;
        subtitle.endTime += offset;
    });
    
    // Re-sort
    this.subtitles.sort((a, b) => a.startTime - b.endTime);
    
    console.log(`⏰ Subtitle time offset adjusted: ${offset} seconds`);
};

/**
 * Get next subtitle
 */
window.SubtitleSync.prototype.getNextSubtitle = function() {
    if (this.currentIndex < this.subtitles.length - 1) {
        return this.subtitles[this.currentIndex + 1];
    }
    return null;
};

/**
 * Get previous subtitle
 */
window.SubtitleSync.prototype.getPreviousSubtitle = function() {
    if (this.currentIndex > 0) {
        return this.subtitles[this.currentIndex - 1];
    }
    return null;
};

/**
 * Get subtitles in time range
 */
window.SubtitleSync.prototype.getSubtitlesInRange = function(startTime, endTime) {
    return this.subtitles.filter(subtitle => {
        return subtitle.startTime <= endTime && subtitle.endTime >= startTime;
    });
};

/**
 * Format time display
 */
window.SubtitleSync.prototype.formatTime = function(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

/**
 * Get synchronization status
 */
window.SubtitleSync.prototype.getStatus = function() {
    return {
        isPlaying: this.isPlaying,
        currentTime: this.currentTime,
        currentIndex: this.currentIndex,
        totalSubtitles: this.subtitles.length,
        currentSubtitle: this.getCurrentSubtitle(),
        updateInterval: this.updateInterval,
        performanceMode: this.performanceMode
    };
};

/**
 * Reset synchronizer
 */
window.SubtitleSync.prototype.reset = function() {
    this.stopSync();
    this.subtitles = [];
    this.currentIndex = -1;
    this.currentTime = 0;
    this.lastUpdateTime = 0;
    this.performanceMode = true;
    this.updateInterval = 50;
    console.log('🔄 Subtitle synchronizer reset');
};

/**
 * Set update interval
 */
window.SubtitleSync.prototype.setUpdateInterval = function(interval) {
    if (typeof interval === 'number' && interval > 0) {
        this.updateInterval = interval;
        console.log(`⏱️ Update interval set to: ${interval}ms`);
        
        // If playing, restart sync
        if (this.isPlaying) {
            this.stopSync();
            this.startSync();
        }
    }
};

/**
 * Set performance mode
 */
window.SubtitleSync.prototype.setPerformanceMode = function(enabled) {
    this.performanceMode = enabled;
    if (enabled) {
        this.updateInterval = 100;
    } else {
        this.updateInterval = 50;
    }
    
    console.log(`⚡ Performance mode: ${enabled ? 'enabled' : 'disabled'}`);
    
    // If playing, restart sync
    if (this.isPlaying) {
        this.stopSync();
        this.startSync();
    }
};

/**
 * Get statistics
 */
window.SubtitleSync.prototype.getStatistics = function() {
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
};

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SubtitleSync;
}