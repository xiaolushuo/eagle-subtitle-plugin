/**
 * Eagle Subtitle Plugin - Main Entry Point
 * This is the main entry point for the Eagle subtitle plugin
 */

// Import required modules
const SubtitleUtils = require('./utils.js');
const SubtitleParser = require('./subtitle-parser.js');
const SubtitleSync = require('./subtitle-sync.js');

// Plugin state
let pluginState = {
    initialized: false,
    currentVideo: null,
    currentSubtitles: [],
    subtitleSync: null,
    overlayWindow: null,
    timeOffset: 0,
    subtitlesVisible: true
};

/**
 * Initialize the plugin
 */
async function initialize() {
    if (pluginState.initialized) {
        console.log('Plugin already initialized');
        return;
    }

    console.log('🎬 Initializing Eagle Subtitle Plugin...');
    
    try {
        // Initialize subtitle sync
        pluginState.subtitleSync = new SubtitleSync();
        pluginState.subtitleSync.onSubtitleChange = displaySubtitle;
        
        // Set up event listeners
        await setupEventListeners();
        
        pluginState.initialized = true;
        console.log('✅ Eagle Subtitle Plugin initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize plugin:', error);
    }
}

/**
 * Set up event listeners
 */
async function setupEventListeners() {
    // Listen for plugin creation
    eagle.onPluginCreate(async (plugin) => {
        console.log('🔧 Plugin created, setting up listeners...');
        await setupPluginListeners();
    });

    // Listen for plugin run
    eagle.onPluginRun(async () => {
        console.log('📁 Plugin run triggered');
        await handleFileSelection();
    });

    // Listen for library changes
    eagle.onLibraryChanged(async (libraryPath) => {
        console.log('📚 Library changed:', libraryPath);
        await resetPlugin();
    });
}

/**
 * Set up plugin-specific listeners
 */
async function setupPluginListeners() {
    if (!eagle.player) {
        console.warn('⚠️ Eagle player not available');
        return;
    }

    // Player event listeners
    if (eagle.player.onPlay) {
        eagle.player.onPlay(() => {
            console.log('▶️ Video started playing');
            if (pluginState.subtitleSync) {
                pluginState.subtitleSync.startSync();
            }
        });
    }

    if (eagle.player.onPause) {
        eagle.player.onPause(() => {
            console.log('⏸️ Video paused');
            if (pluginState.subtitleSync) {
                pluginState.subtitleSync.stopSync();
            }
        });
    }

    if (eagle.player.onTimeUpdate) {
        eagle.player.onTimeUpdate((time) => {
            if (pluginState.subtitleSync) {
                pluginState.subtitleSync.setCurrentTime(time + pluginState.timeOffset);
            }
        });
    }

    if (eagle.player.onEnded) {
        eagle.player.onEnded(() => {
            console.log('🏁 Video ended');
            if (pluginState.subtitleSync) {
                pluginState.subtitleSync.stopSync();
                displaySubtitle(null);
            }
        });
    }

    console.log('✅ Player listeners set up');
}

/**
 * Handle file selection
 */
async function handleFileSelection() {
    try {
        const selectedItems = await eagle.item.getSelected();
        if (selectedItems.length === 0) {
            console.log('❌ No items selected');
            return;
        }

        const item = selectedItems[0];
        
        if (!SubtitleUtils.isVideoFile(item.name)) {
            console.log('❌ Selected item is not a video file:', item.name);
            return;
        }

        console.log('🎥 Video file selected:', item.name);
        pluginState.currentVideo = item;

        // Load subtitles
        await loadSubtitlesForVideo(item);

        // Create overlay
        await createSubtitleOverlay();

    } catch (error) {
        console.error('❌ Error handling file selection:', error);
    }
}

/**
 * Load subtitles for a video
 */
async function loadSubtitlesForVideo(videoItem) {
    try {
        console.log('🔍 Loading subtitles for video...');

        // Get video file path
        const videoPath = await getVideoFilePath(videoItem);
        if (!videoPath) {
            console.log('❌ Could not get video file path');
            showNotification('Could not get video file path');
            return;
        }

        console.log('📹 Video path:', videoPath);

        // Find subtitle file
        const subtitlePath = SubtitleUtils.getSubtitlePath(videoPath);
        if (!subtitlePath) {
            console.log('❌ No subtitle file found');
            showNotification('No subtitle file found');
            return;
        }

        console.log('📝 Subtitle path:', subtitlePath);

        // Read subtitle file
        const content = SubtitleUtils.readFile(subtitlePath);
        if (!content) {
            console.log('❌ Could not read subtitle file');
            showNotification('Could not read subtitle file');
            return;
        }

        // Parse subtitles
        const fileExt = SubtitleUtils.getFileExtension(subtitlePath);
        const parser = new SubtitleParser();
        pluginState.currentSubtitles = parser.parse(content, fileExt);

        if (pluginState.currentSubtitles.length === 0) {
            console.log('❌ No subtitles parsed');
            showNotification('No subtitles found in file');
            return;
        }

        // Load subtitles into sync
        if (pluginState.subtitleSync) {
            pluginState.subtitleSync.loadSubtitles(pluginState.currentSubtitles);
        }

        console.log(`✅ Loaded ${pluginState.currentSubtitles.length} subtitles`);
        showNotification(`Loaded ${pluginState.currentSubtitles.length} subtitles`);

    } catch (error) {
        console.error('❌ Error loading subtitles:', error);
        showNotification('Error loading subtitles');
    }
}

/**
 * Get video file path
 */
async function getVideoFilePath(videoItem) {
    try {
        const libraryPath = eagle.library.path;
        console.log('📚 Library path:', libraryPath);

        // Possible video file paths
        const possiblePaths = [
            `${libraryPath}/images/${videoItem.id}${videoItem.ext}`,
            `${libraryPath}/images/${videoItem.id}/${videoItem.name}`,
            `${libraryPath}/${videoItem.id}${videoItem.ext}`,
            `${libraryPath}/assets/${videoItem.id}${videoItem.ext}`
        ];

        for (const path of possiblePaths) {
            if (SubtitleUtils.fileExists(path)) {
                return path;
            }
        }

        console.log('❌ Video file not found in any expected location');
        return null;

    } catch (error) {
        console.error('❌ Error getting video path:', error);
        return null;
    }
}

/**
 * Create subtitle overlay
 */
async function createSubtitleOverlay() {
    try {
        // Close existing overlay
        if (pluginState.overlayWindow) {
            await pluginState.overlayWindow.close();
            pluginState.overlayWindow = null;
        }

        console.log('🪟 Creating subtitle overlay...');

        // Create new overlay window
        const { BrowserWindow } = require('electron');
        
        pluginState.overlayWindow = new BrowserWindow({
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

        // Load overlay HTML
        await pluginState.overlayWindow.loadFile('overlay.html');

        // Position overlay
        await positionOverlayWindow();

        // Set up overlay events
        setupOverlayEvents();

        console.log('✅ Subtitle overlay created');

    } catch (error) {
        console.error('❌ Error creating overlay:', error);
        showNotification('Error creating subtitle overlay');
    }
}

/**
 * Position overlay window
 */
async function positionOverlayWindow() {
    try {
        if (!pluginState.overlayWindow) return;

        const eagleWindow = await getEagleMainWindow();
        if (eagleWindow) {
            const bounds = eagleWindow.getBounds();
            pluginState.overlayWindow.setBounds(bounds);
            console.log('📍 Overlay positioned to Eagle window');
        } else {
            // Fallback to full screen
            const { screen } = require('electron');
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;
            
            pluginState.overlayWindow.setBounds({
                x: 0,
                y: 0,
                width: width,
                height: height
            });
            
            console.log('📍 Overlay positioned to full screen');
        }

    } catch (error) {
        console.error('❌ Error positioning overlay:', error);
    }
}

/**
 * Get Eagle main window
 */
async function getEagleMainWindow() {
    try {
        if (eagle.window && eagle.window.getMainWindow) {
            return await eagle.window.getMainWindow();
        }

        // Fallback: find window by title
        const { BrowserWindow } = require('electron');
        const windows = BrowserWindow.getAllWindows();
        
        return windows.find(window => {
            const title = window.getTitle();
            return title.includes('Eagle') && !title.includes('subtitle');
        });

    } catch (error) {
        console.error('❌ Error getting Eagle main window:', error);
        return null;
    }
}

/**
 * Set up overlay events
 */
function setupOverlayEvents() {
    if (!pluginState.overlayWindow) return;

    // Handle overlay close
    pluginState.overlayWindow.on('closed', () => {
        pluginState.overlayWindow = null;
        console.log('🪟 Overlay window closed');
    });

    // Handle overlay load
    pluginState.overlayWindow.webContents.on('did-finish-load', () => {
        console.log('🌐 Overlay page loaded');
    });

    // Set up IPC communication
    setupOverlayCommunication();
}

/**
 * Set up overlay communication
 */
function setupOverlayCommunication() {
    if (!pluginState.overlayWindow) return;

    const ipcMain = require('electron').ipcMain;

    // Handle offset adjustment
    ipcMain.on('adjust-offset-request', async () => {
        await adjustTimeOffset();
    });

    // Handle style change
    ipcMain.on('style-change-request', async () => {
        await changeSubtitleStyle();
    });

    // Handle toggle subtitles
    ipcMain.on('toggle-subtitles-request', () => {
        pluginState.subtitlesVisible = !pluginState.subtitlesVisible;
        console.log('👁️ Subtitles visible:', pluginState.subtitlesVisible);
    });

    // Handle reload subtitles
    ipcMain.on('reload-subtitles-request', async () => {
        if (pluginState.currentVideo) {
            await loadSubtitlesForVideo(pluginState.currentVideo);
        }
    });
}

/**
 * Display subtitle
 */
function displaySubtitle(subtitle) {
    if (!pluginState.overlayWindow || !pluginState.subtitlesVisible) {
        return;
    }

    try {
        const subtitleData = {
            text: subtitle ? subtitle.text : '',
            visible: !!subtitle,
            timestamp: Date.now()
        };

        pluginState.overlayWindow.webContents.send('subtitle-update', subtitleData);

    } catch (error) {
        console.error('❌ Error displaying subtitle:', error);
    }
}

/**
 * Adjust time offset
 */
async function adjustTimeOffset() {
    try {
        const offset = prompt('Enter time offset in seconds (positive to delay, negative to advance):', '0');
        if (offset !== null) {
            pluginState.timeOffset = parseFloat(offset) || 0;
            console.log('⏰ Time offset set to:', pluginState.timeOffset, 'seconds');
            showNotification(`Time offset: ${pluginState.timeOffset}s`);
        }
    } catch (error) {
        console.error('❌ Error adjusting time offset:', error);
    }
}

/**
 * Change subtitle style
 */
async function changeSubtitleStyle() {
    try {
        const fontSize = prompt('Enter font size (12-32):', '18');
        const position = prompt('Enter subtitle position (top/middle/bottom):', 'bottom');
        
        if (fontSize !== null && position !== null) {
            const styleData = {
                fontSize: Math.max(12, Math.min(32, parseInt(fontSize) || 18)),
                position: ['top', 'middle', 'bottom'].includes(position) ? position : 'bottom'
            };
            
            pluginState.overlayWindow.webContents.send('style-update', styleData);
            console.log('🎨 Subtitle style updated:', styleData);
            showNotification('Subtitle style updated');
        }
    } catch (error) {
        console.error('❌ Error changing subtitle style:', error);
    }
}

/**
 * Show notification
 */
function showNotification(message) {
    console.log('📢', message);
    
    if (pluginState.overlayWindow) {
        try {
            pluginState.overlayWindow.webContents.send('notification', message);
        } catch (error) {
            console.error('❌ Error sending notification:', error);
        }
    }
}

/**
 * Reset plugin
 */
async function resetPlugin() {
    console.log('🔄 Resetting plugin...');
    
    // Close overlay
    if (pluginState.overlayWindow) {
        await pluginState.overlayWindow.close();
        pluginState.overlayWindow = null;
    }
    
    // Reset state
    pluginState.currentVideo = null;
    pluginState.currentSubtitles = [];
    pluginState.timeOffset = 0;
    
    // Stop sync
    if (pluginState.subtitleSync) {
        pluginState.subtitleSync.stopSync();
    }
    
    console.log('✅ Plugin reset');
}

/**
 * Start player monitoring
 */
async function startPlayerMonitoring() {
    console.log('🔍 Starting player monitoring...');
    
    // Use event-based monitoring if available
    if (eagle.player && eagle.player.onTimeUpdate) {
        console.log('✅ Using event-based monitoring');
        return;
    }
    
    // Fall back to polling
    console.log('⏱️ Using polling-based monitoring');
    startPollingMode();
}

/**
 * Start polling mode
 */
function startPollingMode() {
    // Monitor play state
    setInterval(async () => {
        try {
            if (eagle.player && eagle.player.getState) {
                const state = await eagle.player.getState();
                // Handle state changes here
            }
        } catch (error) {
            // Ignore errors, continue polling
        }
    }, 100);
    
    // Monitor playback time
    setInterval(async () => {
        try {
            if (eagle.player && eagle.player.getCurrentTime) {
                const currentTime = await eagle.player.getCurrentTime();
                if (pluginState.subtitleSync) {
                    pluginState.subtitleSync.setCurrentTime(currentTime + pluginState.timeOffset);
                }
            }
        } catch (error) {
            // Ignore errors, continue polling
        }
    }, 50);
}

// Initialize plugin when ready
eagle.onReady(async () => {
    console.log('🚀 Eagle is ready, initializing plugin...');
    await initialize();
    await startPlayerMonitoring();
});

// Export plugin functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initialize,
        resetPlugin,
        handleFileSelection,
        pluginState
    };
}