# Eagle 字幕插件架构说明

## 📋 标准架构概述

根据 Eagle 官方插件开发规范，本插件采用以下标准架构：

### 📁 文件结构

```
eagle-subtitle-plugin/
├── 📄 eagle-plugin.json         # Eagle 插件配置文件
├── 📄 index.js                  # 插件入口文件
├── 📄 main.js                   # 插件主模块
├── 📄 manifest.json              # 插件清单（兼容性）
├── 📄 overlay.html              # 字幕覆盖层
├── 📄 subtitle-parser.js        # 字幕解析器
├── 📄 subtitle-sync.js          # 字幕同步器
├── 📄 utils.js                  # 工具函数
├── 📄 styles.css                # 样式文件
├── 📄 README.md                 # 使用说明
├── 📄 LICENSE                   # 许可证
└── 🎨 icon.png                  # 插件图标
```

## 🔧 核心架构组件

### 1. 插件配置文件 (eagle-plugin.json)

```json
{
  "name": "eagle-subtitle-plugin",
  "version": "1.0.0",
  "description": "为 Eagle 播放器提供字幕显示功能",
  "main": "main.js",
  "permissions": [
    "fileSystem",
    "item",
    "player",
    "window"
  ]
}
```

### 2. 插件入口文件 (index.js)

```javascript
// 导出插件对象
module.exports = require('./main.js');
```

### 3. 插件主模块 (main.js)

```javascript
// 创建插件实例
const plugin = new EagleSubtitlePlugin();

// 导出插件对象（符合 Eagle 插件标准）
module.exports = {
    // 插件创建事件
    onPluginCreate: (eaglePlugin) => {
        plugin.handlePluginCreate(eaglePlugin);
    },
    
    // 插件运行事件
    onPluginRun: () => {
        plugin.handlePluginRun();
    },
    
    // 资源库切换事件
    onLibraryChanged: (libraryPath) => {
        plugin.handleLibraryChanged(libraryPath);
    },
    
    // 插件销毁事件
    onPluginDestroy: () => {
        plugin.resetPlugin();
    }
};
```

## 🎯 Eagle 插件事件系统

### 标准事件

| 事件名称 | 触发时机 | 用途 |
|----------|----------|------|
| `onPluginCreate` | 插件创建时 | 初始化插件，设置事件监听 |
| `onPluginRun` | 插件运行时 | 处理用户操作，执行主要功能 |
| `onLibraryChanged` | 资源库切换时 | 重置插件状态，清理资源 |
| `onPluginDestroy` | 插件销毁时 | 清理资源，保存状态 |
| `onPluginPause` | 插件暂停时 | 暂停功能执行 |
| `onPluginResume` | 插件恢复时 | 恢复功能执行 |

### 事件处理示例

```javascript
module.exports = {
    onPluginCreate: (eaglePlugin) => {
        console.log('插件创建');
        // 初始化插件
    },
    
    onPluginRun: () => {
        console.log('插件运行');
        // 执行主要功能
    },
    
    onLibraryChanged: (libraryPath) => {
        console.log('资源库切换:', libraryPath);
        // 重置插件状态
    }
};
```

## 🔌 Eagle API 接口

### 1. 文件系统 API

```javascript
// 获取选中的项目
const selectedItems = await eagle.item.getSelected();

// 获取资源库路径
const libraryPath = eagle.library.path;
```

### 2. 播放器 API

```javascript
// 播放事件
eagle.player.onPlay(() => {
    console.log('视频开始播放');
});

// 暂停事件
eagle.player.onPause(() => {
    console.log('视频暂停');
});

// 时间更新事件
eagle.player.onTimeUpdate((time) => {
    console.log('当前时间:', time);
});

// 获取播放状态
const state = await eagle.player.getState();

// 获取当前时间
const currentTime = await eagle.player.getCurrentTime();
```

### 3. 窗口 API

```javascript
// 获取主窗口
const mainWindow = await eagle.window.getMainWindow();

// 获取窗口边界
const bounds = mainWindow.getBounds();
```

## 📦 权限系统

### 权限类型

| 权限名称 | 功能描述 |
|----------|----------|
| `fileSystem` | 文件系统访问权限 |
| `item` | 项目访问权限 |
| `player` | 播放器访问权限 |
| `window` | 窗口创建权限 |

### 权限配置

```json
{
  "permissions": [
    "fileSystem",
    "item",
    "player",
    "window"
  ]
}
```

## 🏗️ 模块化设计

### 1. 字幕解析器 (subtitle-parser.js)

```javascript
class SubtitleParser {
    parse(content, format) {
        // 解析字幕内容
    }
    
    detectFormat(content) {
        // 自动检测字幕格式
    }
}
```

### 2. 字幕同步器 (subtitle-sync.js)

```javascript
class SubtitleSync {
    loadSubtitles(subtitles) {
        // 加载字幕数据
    }
    
    startSync() {
        // 开始同步
    }
    
    stopSync() {
        // 停止同步
    }
}
```

### 3. 工具函数 (utils.js)

```javascript
class SubtitleUtils {
    static getSubtitlePath(videoPath) {
        // 获取字幕文件路径
    }
    
    static formatTime(seconds) {
        // 格式化时间显示
    }
}
```

## 🎨 用户界面

### 1. 覆盖层 (overlay.html)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Eagle 字幕覆盖层</title>
    <style>
        /* 字幕样式 */
    </style>
</head>
<body>
    <div id="subtitleContainer">
        <div id="subtitleText"></div>
    </div>
    <div id="controlPanel">
        <!-- 控制面板 -->
    </div>
    <script>
        // 覆盖层逻辑
    </script>
</body>
</html>
```

### 2. 样式文件 (styles.css)

```css
/* 字幕容器样式 */
#subtitleContainer {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
}

/* 字幕文本样式 */
#subtitleText {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
}
```

## 🔄 生命周期管理

### 1. 插件生命周期

```
创建 → 初始化 → 运行 → 暂停/恢复 → 销毁
```

### 2. 资源管理

```javascript
class EagleSubtitlePlugin {
    constructor() {
        this.overlayWindow = null;
        this.currentVideo = null;
        this.currentSubtitles = [];
    }
    
    async resetPlugin() {
        // 关闭覆盖层
        if (this.overlayWindow) {
            await this.overlayWindow.close();
        }
        
        // 重置状态
        this.currentVideo = null;
        this.currentSubtitles = [];
    }
}
```

## 🚀 部署和分发

### 1. 插件打包

```bash
# 创建插件包
tar -czf eagle-subtitle-plugin-v1.0.0.tar.gz \
    eagle-plugin.json \
    index.js \
    main.js \
    overlay.html \
    subtitle-parser.js \
    subtitle-sync.js \
    utils.js \
    styles.css \
    README.md \
    LICENSE
```

### 2. 安装说明

```
1. 解压插件包到 Eagle 插件目录
2. 重启 Eagle 应用
3. 在插件管理中启用插件
```

## 📊 性能优化

### 1. 内存管理

```javascript
// 及时清理资源
async cleanup() {
    if (this.overlayWindow) {
        await this.overlayWindow.close();
        this.overlayWindow = null;
    }
}
```

### 2. 性能监控

```javascript
// 监控性能指标
const performance = {
    memoryUsage: process.memoryUsage(),
    subtitleCount: this.currentSubtitles.length,
    syncInterval: this.updateInterval
};
```

## 🐛 错误处理

### 1. 异常捕获

```javascript
try {
    await this.loadSubtitlesForVideo(item);
} catch (error) {
    console.error('加载字幕失败:', error);
    this.showNotification('加载字幕失败');
}
```

### 2. 错误恢复

```javascript
async recover() {
    try {
        await this.resetPlugin();
        await this.init();
    } catch (error) {
        console.error('恢复失败:', error);
    }
}
```

---

## 📝 总结

本插件严格按照 Eagle 官方插件开发规范设计，采用模块化架构，具有良好的可维护性和扩展性。通过标准的事件系统、权限管理和 API 接口，确保与 Eagle 应用的完美集成。