/**
 * Eagle 视频字幕插件主控制器
 * 功能：检测视频播放、加载字幕、创建覆盖层、同步字幕显示
 */

// 导入依赖
const SubtitleUtils = require('./utils.js');
const SubtitleParser = require('./subtitle-parser.js');
const SubtitleSync = require('./subtitle-sync.js');

class EagleSubtitlePlugin {
    constructor() {
        this.utils = SubtitleUtils;
        this.parser = new SubtitleParser();
        this.sync = new SubtitleSync();
        
        this.currentVideo = null;
        this.currentSubtitles = [];
        this.isPlaying = false;
        this.overlayWindow = null;
        this.timeOffset = 0;
        this.subtitlesVisible = true;
        
        this.init();
    }
    
    async init() {
        console.log('🎬 Eagle 字幕插件启动中...');
        
        // Eagle 插件初始化
        eagle.onPluginCreate(async (plugin) => {
            console.log('✅ Eagle 字幕插件已初始化');
            await this.setupEventListeners();
            await this.startPlayerMonitoring();
            await this.checkEagleAPI();
        });
        
        // 设置字幕同步回调
        this.sync.onSubtitleChange = (subtitle) => {
            this.displaySubtitle(subtitle);
        };
    }
    
    // 检查 Eagle API 支持情况
    async checkEagleAPI() {
        const supportedMethods = [];
        const apiMethods = [
            'getWindow', 'getState', 'getCurrentTime', 'getDuration',
            'onPlay', 'onPause', 'onTimeUpdate', 'onEnded'
        ];
        
        for (const method of apiMethods) {
            if (eagle.player && typeof eagle.player[method] === 'function') {
                supportedMethods.push(method);
            }
        }
        
        console.log('🔧 支持的 Eagle 播放器 API:', supportedMethods);
        
        if (supportedMethods.length === 0) {
            console.warn('⚠️ 未检测到 Eagle 播放器 API，使用轮询模式');
        }
    }
    
    // 设置事件监听器
    async setupEventListeners() {
        // 监听文件选择变化
        eagle.onPluginRun(async () => {
            console.log('📁 检测到文件选择变化');
            await this.handleFileSelection();
        });
        
        // 监听资源库切换
        eagle.onLibraryChanged(async (libraryPath) => {
            console.log('📚 资源库切换:', libraryPath);
            await this.resetPlugin();
        });
        
        // 设置播放器事件监听
        this.setupPlayerEventListeners();
    }
    
    // 设置播放器事件监听
    setupPlayerEventListeners() {
        if (!eagle.player) return;
        
        // 播放事件
        if (eagle.player.onPlay) {
            eagle.player.onPlay(() => {
                console.log('▶️ 视频开始播放');
                this.isPlaying = true;
                this.sync.startSync();
            });
        }
        
        // 暂停事件
        if (eagle.player.onPause) {
            eagle.player.onPause(() => {
                console.log('⏸️ 视频暂停');
                this.isPlaying = false;
                this.sync.stopSync();
            });
        }
        
        // 时间更新事件
        if (eagle.player.onTimeUpdate) {
            eagle.player.onTimeUpdate((time) => {
                this.sync.setCurrentTime(time + this.timeOffset);
            });
        }
        
        // 结束事件
        if (eagle.player.onEnded) {
            eagle.player.onEnded(() => {
                console.log('🏁 视频播放结束');
                this.isPlaying = false;
                this.sync.stopSync();
                this.displaySubtitle(null);
            });
        }
    }
    
    // 处理文件选择
    async handleFileSelection() {
        try {
            const selectedItems = await eagle.item.getSelected();
            if (selectedItems.length === 0) {
                console.log('❌ 没有选中的文件');
                return;
            }
            
            const item = selectedItems[0];
            
            if (!this.utils.isVideoFile(item.name)) {
                console.log('❌ 选中的不是视频文件:', item.name);
                return;
            }
            
            console.log('🎥 检测到视频文件:', item.name);
            this.currentVideo = item;
            
            // 加载字幕
            await this.loadSubtitlesForVideo(item);
            
            // 创建字幕覆盖层
            await this.createSubtitleOverlay();
            
        } catch (error) {
            console.error('❌ 处理文件选择失败:', error);
        }
    }
    
    // 为视频加载字幕
    async loadSubtitlesForVideo(videoItem) {
        try {
            console.log('🔍 正在查找字幕文件...');
            
            // 获取视频文件路径
            const videoPath = await this.getVideoFilePath(videoItem);
            if (!videoPath) {
                console.log('❌ 无法获取视频文件路径');
                return;
            }
            
            console.log('📹 视频文件路径:', videoPath);
            
            // 查找字幕文件
            const subtitlePath = this.utils.getSubtitlePath(videoPath);
            if (!subtitlePath) {
                console.log('❌ 未找到字幕文件');
                this.showNotification('未找到字幕文件');
                return;
            }
            
            console.log('📝 字幕文件路径:', subtitlePath);
            
            // 读取字幕文件
            const content = this.utils.readFile(subtitlePath);
            if (!content) {
                console.log('❌ 无法读取字幕文件');
                this.showNotification('无法读取字幕文件');
                return;
            }
            
            // 解析字幕
            const fileExt = this.utils.getFileExtension(subtitlePath);
            this.currentSubtitles = this.parser.parse(content, fileExt);
            
            if (this.currentSubtitles.length === 0) {
                console.log('❌ 字幕解析失败');
                this.showNotification('字幕解析失败');
                return;
            }
            
            // 加载到同步器
            this.sync.loadSubtitles(this.currentSubtitles);
            
            console.log(`✅ 成功加载 ${this.currentSubtitles.length} 条字幕`);
            this.showNotification(`已加载 ${this.currentSubtitles.length} 条字幕`);
            
        } catch (error) {
            console.error('❌ 加载字幕失败:', error);
            this.showNotification('加载字幕失败');
        }
    }
    
    // 获取视频文件路径
    async getVideoFilePath(videoItem) {
        try {
            const libraryPath = eagle.library.path;
            console.log('📚 资源库路径:', libraryPath);
            
            // Eagle 可能的文件存储路径
            const possiblePaths = [
                `${libraryPath}/images/${videoItem.id}${videoItem.ext}`,
                `${libraryPath}/images/${videoItem.id}/${videoItem.name}`,
                `${libraryPath}/${videoItem.id}${videoItem.ext}`,
                `${libraryPath}/assets/${videoItem.id}${videoItem.ext}`
            ];
            
            for (const path of possiblePaths) {
                if (this.utils.fileExists(path)) {
                    return path;
                }
            }
            
            console.log('❌ 在所有可能路径中均未找到视频文件');
            return null;
            
        } catch (error) {
            console.error('❌ 获取视频路径失败:', error);
            return null;
        }
    }
    
    // 创建字幕覆盖层
    async createSubtitleOverlay() {
        try {
            // 如果已存在覆盖层，先关闭
            if (this.overlayWindow) {
                await this.overlayWindow.close();
                this.overlayWindow = null;
            }
            
            console.log('🪟 正在创建字幕覆盖层...');
            
            // 创建覆盖窗口
            const { BrowserWindow } = require('electron');
            
            this.overlayWindow = new BrowserWindow({
                width: 800,
                height: 600,
                transparent: true,
                frame: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                resizable: false,
                movable: false,
                focusable: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                }
            });
            
            // 加载覆盖层页面
            await this.overlayWindow.loadFile('overlay.html');
            
            // 设置窗口位置（尝试覆盖 Eagle 播放器）
            await this.positionOverlayWindow();
            
            // 监听窗口事件
            this.setupOverlayWindowEvents();
            
            console.log('✅ 字幕覆盖层创建成功');
            
        } catch (error) {
            console.error('❌ 创建字幕覆盖层失败:', error);
            this.showNotification('创建字幕覆盖层失败');
        }
    }
    
    // 设置覆盖窗口位置
    async positionOverlayWindow() {
        try {
            if (!this.overlayWindow) return;
            
            // 获取 Eagle 主窗口
            const eagleWindow = await this.getEagleMainWindow();
            if (eagleWindow) {
                const bounds = eagleWindow.getBounds();
                this.overlayWindow.setBounds(bounds);
                console.log('📍 覆盖层已定位到 Eagle 主窗口');
            } else {
                // 如果无法获取 Eagle 窗口，使用屏幕中央
                const { screen } = require('electron');
                const primaryDisplay = screen.getPrimaryDisplay();
                const { width, height } = primaryDisplay.workAreaSize;
                
                this.overlayWindow.setBounds({
                    x: 0,
                    y: 0,
                    width: width,
                    height: height
                });
                
                console.log('📍 覆盖层已定位到全屏');
            }
            
        } catch (error) {
            console.error('❌ 设置覆盖层位置失败:', error);
        }
    }
    
    // 获取 Eagle 主窗口
    async getEagleMainWindow() {
        try {
            if (eagle.window && eagle.window.getMainWindow) {
                return await eagle.window.getMainWindow();
            }
            
            // 备用方法：通过标题查找
            const { BrowserWindow } = require('electron');
            const windows = BrowserWindow.getAllWindows();
            
            return windows.find(window => {
                const title = window.getTitle();
                return title.includes('Eagle') && !title.includes('字幕');
            });
            
        } catch (error) {
            console.error('❌ 获取 Eagle 主窗口失败:', error);
            return null;
        }
    }
    
    // 设置覆盖窗口事件监听
    setupOverlayWindowEvents() {
        if (!this.overlayWindow) return;
        
        // 监听覆盖窗口关闭
        this.overlayWindow.on('closed', () => {
            this.overlayWindow = null;
            console.log('🪟 字幕覆盖层已关闭');
        });
        
        // 监听来自覆盖窗口的消息
        this.overlayWindow.webContents.on('did-finish-load', () => {
            console.log('🌐 覆盖层页面加载完成');
        });
        
        // 监听控制请求
        this.setupOverlayCommunication();
    }
    
    // 设置覆盖层通信
    setupOverlayCommunication() {
        if (!this.overlayWindow) return;
        
        const ipcMain = require('electron').ipcMain;
        
        // 监听调整偏移请求
        ipcMain.on('adjust-offset-request', async () => {
            await this.adjustTimeOffset();
        });
        
        // 监听样式更改请求
        ipcMain.on('style-change-request', async () => {
            await this.changeSubtitleStyle();
        });
        
        // 监听显示/隐藏请求
        ipcMain.on('toggle-subtitles-request', () => {
            this.subtitlesVisible = !this.subtitlesVisible;
            console.log('👁️ 字幕显示状态:', this.subtitlesVisible);
        });
        
        // 监听重新加载请求
        ipcMain.on('reload-subtitles-request', async () => {
            if (this.currentVideo) {
                await this.loadSubtitlesForVideo(this.currentVideo);
            }
        });
    }
    
    // 启动播放器监控
    async startPlayerMonitoring() {
        console.log('🔍 启动播放器监控...');
        
        // 如果有事件监听，优先使用事件
        if (eagle.player && eagle.player.onTimeUpdate) {
            console.log('✅ 使用事件监听模式');
            return;
        }
        
        // 否则使用轮询模式
        console.log('⏱️ 使用轮询模式');
        this.startPollingMode();
    }
    
    // 启动轮询模式
    startPollingMode() {
        // 监控播放状态
        setInterval(async () => {
            try {
                if (eagle.player && eagle.player.getState) {
                    const state = await eagle.player.getState();
                    const wasPlaying = this.isPlaying;
                    this.isPlaying = state.isPlaying;
                    
                    if (this.isPlaying && !wasPlaying) {
                        console.log('▶️ 检测到播放开始');
                        this.sync.startSync();
                    } else if (!this.isPlaying && wasPlaying) {
                        console.log('⏸️ 检测到播放暂停');
                        this.sync.stopSync();
                    }
                }
            } catch (error) {
                // 忽略错误，继续轮询
            }
        }, 100);
        
        // 监控播放时间
        setInterval(async () => {
            try {
                if (eagle.player && eagle.player.getCurrentTime && this.isPlaying) {
                    const currentTime = await eagle.player.getCurrentTime();
                    this.sync.setCurrentTime(currentTime + this.timeOffset);
                }
            } catch (error) {
                // 忽略错误，继续轮询
            }
        }, 50);
    }
    
    // 显示字幕
    displaySubtitle(subtitle) {
        if (!this.overlayWindow || !this.subtitlesVisible) {
            return;
        }
        
        try {
            const subtitleData = {
                text: subtitle ? subtitle.text : '',
                visible: !!subtitle,
                timestamp: Date.now()
            };
            
            this.overlayWindow.webContents.send('subtitle-update', subtitleData);
            
        } catch (error) {
            console.error('❌ 发送字幕更新失败:', error);
        }
    }
    
    // 调整时间偏移
    async adjustTimeOffset() {
        try {
            const offset = prompt('请输入时间偏移（秒，正数延迟，负数提前）:', '0');
            if (offset !== null) {
                this.timeOffset = parseFloat(offset) || 0;
                console.log('⏰ 时间偏移已设置为:', this.timeOffset, '秒');
                this.showNotification(`时间偏移: ${this.timeOffset}秒`);
            }
        } catch (error) {
            console.error('❌ 调整时间偏移失败:', error);
        }
    }
    
    // 更改字幕样式
    async changeSubtitleStyle() {
        try {
            const fontSize = prompt('请输入字体大小 (12-32):', '18');
            const position = prompt('请输入字幕位置 (top/middle/bottom):', 'bottom');
            
            if (fontSize !== null && position !== null) {
                const styleData = {
                    fontSize: Math.max(12, Math.min(32, parseInt(fontSize) || 18)),
                    position: ['top', 'middle', 'bottom'].includes(position) ? position : 'bottom'
                };
                
                this.overlayWindow.webContents.send('style-update', styleData);
                console.log('🎨 字幕样式已更新:', styleData);
                this.showNotification('字幕样式已更新');
            }
        } catch (error) {
            console.error('❌ 更改字幕样式失败:', error);
        }
    }
    
    // 显示通知
    showNotification(message) {
        this.utils.showNotification(message);
        
        if (this.overlayWindow) {
            try {
                this.overlayWindow.webContents.send('notification', message);
            } catch (error) {
                console.error('❌ 发送通知失败:', error);
            }
        }
    }
    
    // 重置插件
    async resetPlugin() {
        console.log('🔄 重置插件...');
        
        // 关闭覆盖层
        if (this.overlayWindow) {
            await this.overlayWindow.close();
            this.overlayWindow = null;
        }
        
        // 重置状态
        this.currentVideo = null;
        this.currentSubtitles = [];
        this.isPlaying = false;
        this.timeOffset = 0;
        
        // 停止同步
        this.sync.stopSync();
        
        console.log('✅ 插件已重置');
    }
}

// 初始化插件
let subtitlePlugin;
try {
    subtitlePlugin = new EagleSubtitlePlugin();
} catch (error) {
    console.error('❌ 插件初始化失败:', error);
}

// 导出插件类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EagleSubtitlePlugin;
}