# 🎬 Eagle 字幕插件 - 编译版使用指南

## 📦 下载地址

### GitHub Release 下载
**最新版本**: v1.0.1  
**下载链接**: https://github.com/xiaolushuo/eagle-subtitle-plugin/releases/download/v1.0.1/eagle-subtitle-plugin-v1.0.0-complete.tar.gz

**备用下载**: https://github.com/xiaolushuo/eagle-subtitle-plugin/releases/download/v1.0.1/eagle-subtitle-plugin-v1.0.0-final.tar.gz

## 🚀 快速安装

### 1. 下载插件
```bash
# 下载编译版插件
wget https://github.com/xiaolushuo/eagle-subtitle-plugin/releases/download/v1.0.1/eagle-subtitle-plugin-v1.0.0-complete.tar.gz

# 解压
tar -xzf eagle-subtitle-plugin-v1.0.0-complete.tar.gz
```

### 2. 复制到 Eagle 插件目录

#### Windows 系统
```
复制整个文件夹到：
C:\Users\[你的用户名]\AppData\Roaming\Eagle\plugins\eagle-subtitle-plugin-v1.0.0-compiled
```

#### macOS 系统
```bash
cp -r eagle-subtitle-plugin-v1.0.0-compiled ~/Library/Application\ Support/Eagle/plugins/
```

#### Linux 系统
```bash
cp -r eagle-subtitle-plugin-v1.0.0-compiled ~/.config/Eagle/plugins/
```

### 3. 重启 Eagle 并启用插件
1. 重启 Eagle 应用程序
2. 进入 Eagle 设置 → 插件管理
3. 找到 "Eagle 视频字幕插件"
4. 点击启用

## 🎯 使用方法

### 基本使用
1. 在 Eagle 中选择一个视频文件
2. 确保视频文件同目录下有同名字幕文件
   - 例如：`movie.mp4` + `movie.srt`
   - 或：`video.mkv` + `video.ass`
3. 播放视频，字幕会自动显示在视频上

### 快捷键操作
| 快捷键 | 功能 |
|--------|------|
| `H` | 显示/隐藏字幕 |
| `O` | 调整时间偏移 |
| `S` | 更改字幕样式 |
| `ESC` | 隐藏控制面板 |

### 控制面板功能
- 鼠标移动到屏幕顶部显示控制面板
- **显示/隐藏**：切换字幕显示状态
- **调整偏移**：输入时间偏移值（正数延迟，负数提前）
- **样式设置**：调整字幕大小和位置
- **重新加载**：重新加载字幕文件

## 📝 支持的字幕格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| SRT | .srt | 最常用的字幕格式 |
| ASS | .ass | 高级字幕格式，支持样式 |
| SSA | .ssa | ASS 的前身格式 |
| VTT | .vtt | Web 字幕格式 |

### 示例字幕文件

#### SRT 格式
```srt
1
00:00:01,000 --> 00:00:04,000
这是第一条字幕

2
00:00:05,000 --> 00:00:08,000
这是第二条字幕
```

#### ASS 格式
```ass
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,这是第一条字幕
```

#### VTT 格式
```vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
这是第一条字幕

00:00:05.000 --> 00:00:08.000
这是第二条字幕
```

## 🔧 故障排除

### 字幕不显示
1. ✅ 确保字幕文件与视频文件同名
2. ✅ 检查字幕文件格式是否支持（SRT、ASS、SSA、VTT）
3. ✅ 确认字幕文件编码为 UTF-8
4. ✅ 检查 Eagle 播放器是否正在播放
5. ✅ 查看插件是否已正确启用

### 时间不同步
1. 使用 "调整偏移" 功能
2. 输入正数延迟字幕，负数提前字幕
3. 例如：字幕快 2 秒，输入 `-2`
4. 例如：字幕慢 1.5 秒，输入 `1.5`

### 插件无法加载
1. ✅ 确认插件文件放置在正确目录
2. ✅ 检查文件夹结构是否完整
3. ✅ 查看 Eagle 控制台是否有错误信息
4. ✅ 重启 Eagle 应用程序

### 性能问题
- 如果字幕文件很大（超过1000条），插件会自动启用性能模式
- 可以通过调整更新间隔来优化性能
- 关闭不必要的功能可以提高性能

## 📊 技术规格

### 系统要求
- **Eagle**: 最新版本
- **操作系统**: Windows 10+, macOS 10.14+, Linux
- **内存**: 最少 512MB 可用内存
- **存储**: 插件大小约 96KB

### 性能指标
- **加载时间**: < 1秒
- **响应时间**: < 50ms
- **支持字幕数量**: 1000+ 条
- **内存占用**: 优化设计，占用极小

### 文件清单
```
eagle-subtitle-plugin-v1.0.0-compiled/
├── manifest.json              # 插件配置文件 (353 bytes)
├── main.js                    # 主控制器 (17.9 KB)
├── overlay.html              # 字幕覆盖层 (11.1 KB)
├── subtitle-parser.js        # 字幕解析器 (9.2 KB)
├── subtitle-sync.js          # 字幕同步器 (9.5 KB)
├── utils.js                  # 工具函数 (4.2 KB)
├── styles.css                # 样式文件 (4.7 KB)
├── README.md                 # 使用说明 (5.2 KB)
├── package-info.json         # 包信息 (630 bytes)
└── 安装说明.txt              # 中文安装说明 (2.4 KB)
```

## 🌟 功能特点

### 核心功能
- ✅ **自动字幕加载**：自动查找同名字幕文件
- ✅ **多格式支持**：SRT、ASS、SSA、VTT 格式
- ✅ **精确同步**：高精度时间同步算法
- ✅ **样式自定义**：调整字幕大小、位置、透明度
- ✅ **快捷键支持**：便捷的键盘操作
- ✅ **实时调整**：时间偏移和样式调整
- ✅ **响应式设计**：适配不同屏幕尺寸
- ✅ **性能优化**：高效处理大量字幕

### 技术特点
- **模块化设计**：代码结构清晰，易于维护
- **事件驱动**：基于事件的异步处理
- **性能优化**：使用二分查找和缓存机制
- **错误处理**：完整的异常处理机制
- **跨平台**：支持 Windows、macOS、Linux

## 📞 技术支持

### 获取帮助
- **GitHub Issues**: https://github.com/xiaolushuo/eagle-subtitle-plugin/issues
- **项目主页**: https://github.com/xiaolushuo/eagle-subtitle-plugin
- **文档**: https://github.com/xiaolushuo/eagle-subtitle-plugin/blob/main/README.md

### 反馈问题
如果遇到问题，请：
1. 查看 GitHub Issues 是否有类似问题
2. 搜索故障排除部分
3. 如果问题仍未解决，创建新的 Issue

### 贡献代码
欢迎贡献代码和建议！
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](https://github.com/xiaolushuo/eagle-subtitle-plugin/blob/main/LICENSE) 文件。

## 🎉 更新日志

### v1.0.1 (2024-08-21)
- ✅ 发布编译版本，可直接使用
- ✅ 添加详细的安装说明
- ✅ 性能优化和错误修复
- ✅ 改进用户体验

### v1.0.0 (2024-08-21)
- ✅ 初始版本发布
- ✅ 支持 SRT、ASS、VTT 格式
- ✅ 基本字幕显示功能
- ✅ 时间偏移调整
- ✅ 样式自定义
- ✅ 快捷键支持

---

## 🚀 开始使用！

现在您已经拥有了一个功能完整、性能优化的 Eagle 字幕插件。按照上述步骤安装后，即可享受字幕带来的便利观影体验！

**感谢您的使用！** 🎬✨