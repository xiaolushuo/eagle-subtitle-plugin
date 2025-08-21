# Eagle 字幕插件 v1.0.0

## 🎉 新功能
- 🎬 **自动字幕加载**：自动查找与视频同名的字幕文件
- 📝 **多格式支持**：支持 SRT、ASS、SSA、VTT 字幕格式
- ⏰ **精确同步**：高精度的字幕时间同步
- 🎨 **样式自定义**：可调整字幕大小、位置、透明度
- ⌨️ **快捷键支持**：H 键显示/隐藏，O 键调整偏移，S 键更改样式
- 🔄 **实时调整**：支持时间偏移调整，解决字幕不同步问题
- 📱 **响应式设计**：适配不同屏幕尺寸
- ⚡ **性能优化**：支持大量字幕的高效处理

## 🛠️ 技术特性
- **模块化设计**：每个功能都有独立的模块
- **事件驱动**：基于事件的异步处理
- **性能优化**：使用二分查找和缓存机制
- **错误处理**：完整的异常处理机制
- **跨平台**：支持 Windows、macOS、Linux

## 📦 安装方法
1. 下载最新版本的 zip 文件
2. 解压到 Eagle 插件目录：
   - Windows: `%APPDATA%\Eagle\plugins\`
   - macOS: `~/Library/Application Support/Eagle/plugins/`
   - Linux: `~/.config/Eagle/plugins/`
3. 重启 Eagle 应用
4. 在 Eagle 中启用插件

## 🎯 使用方法
1. 在 Eagle 中选择视频文件
2. 确保视频文件同目录下有同名字幕文件
3. 播放视频，字幕会自动显示

## ⌨️ 快捷键
- `H` - 显示/隐藏字幕
- `O` - 调整时间偏移
- `S` - 更改字幕样式
- `ESC` - 隐藏控制面板

## 🐛 修复内容
- 修复了字幕时间同步的精度问题
- 优化了大量字幕文件的处理性能
- 改进了字幕样式的渲染效果
- 增强了错误处理和日志记录

## 📋 文件清单
- `README.md` (5.12 KB)
- `main.js` (17.54 KB)
- `manifest.json` (0.34 KB)
- `overlay.html` (10.87 KB)
- `package-info.json` (0.62 KB)
- `styles.css` (4.66 KB)
- `subtitle-parser.js` (9.03 KB)
- `subtitle-sync.js` (9.34 KB)
- `utils.js` (4.16 KB)


## 🔧 系统要求
- Eagle 应用 (最新版本)
- Node.js >= 14.0.0 (用于开发)
- 支持的操作系统：Windows 10+, macOS 10.14+, Linux

## 📄 许可证
MIT License

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

## 📞 支持
- GitHub Issues: https://github.com/yourusername/eagle-subtitle-plugin/issues
- Email: your-email@example.com

---

**注意**：本插件为第三方开发，与 Eagle 官方无关。使用前请确保符合 Eagle 的使用条款。