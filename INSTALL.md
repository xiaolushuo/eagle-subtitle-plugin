# Eagle 字幕插件安装指南

## 快速安装

### 方法一：手动安装

1. **下载插件**
   ```bash
   git clone https://github.com/yourusername/eagle-subtitle-plugin.git
   cd eagle-subtitle-plugin
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建插件**
   ```bash
   npm run build
   ```

4. **转换图标（可选）**
   ```bash
   npm run convert-icon
   ```

5. **复制到 Eagle 插件目录**
   - Windows: 复制 `dist/` 文件夹到 `%APPDATA%\Eagle\plugins\eagle-subtitle-plugin`
   - macOS: 复制 `dist/` 文件夹到 `~/Library/Application Support/Eagle/plugins/eagle-subtitle-plugin`
   - Linux: 复制 `dist/` 文件夹到 `~/.config/Eagle/plugins/eagle-subtitle-plugin`

6. **重启 Eagle**

### 方法二：直接使用

1. 下载最新版本的 zip 文件
2. 解压到 Eagle 插件目录
3. 重启 Eagle

## 验证安装

1. 打开 Eagle
2. 进入插件管理界面
3. 确认 "Eagle 视频字幕插件" 已启用
4. 检查控制台是否有插件启动日志

## 使用测试

1. 准备测试文件：
   - 视频文件：`test.mp4`
   - 字幕文件：`test.srt`（与视频同名）

2. 在 Eagle 中选择视频文件
3. 播放视频，观察字幕是否正确显示

## 故障排除

### 插件未加载

1. 检查插件目录结构是否正确
2. 确认 `manifest.json` 文件存在且格式正确
3. 查看 Eagle 控制台是否有错误信息

### 字幕不显示

1. 确认字幕文件与视频文件同名
2. 检查字幕文件格式是否支持
3. 确认字幕文件编码为 UTF-8

### 性能问题

1. 大字幕文件会自动启用性能模式
2. 可以通过调整更新间隔优化性能

## 更新插件

1. 备份当前插件配置
2. 下载新版本插件
3. 替换插件文件
4. 重启 Eagle

## 卸载插件

1. 删除插件目录
2. 重启 Eagle
3. 清理相关缓存文件

## 开发环境设置

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 开发步骤

1. 克隆项目
   ```bash
   git clone https://github.com/yourusername/eagle-subtitle-plugin.git
   cd eagle-subtitle-plugin
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 开发模式
   ```bash
   npm run start
   ```

4. 构建生产版本
   ```bash
   npm run build
   ```

### 调试技巧

1. 使用浏览器开发者工具调试 overlay.html
2. 查看控制台日志了解插件运行状态
3. 使用 Eagle 插件 API 文档参考

## 常见问题

### Q: 插件支持哪些字幕格式？
A: 目前支持 SRT、ASS、SSA、VTT 格式。

### Q: 如何调整字幕时间偏移？
A: 使用控制面板的"调整偏移"功能或按 O 键。

### Q: 字幕显示位置可以调整吗？
A: 可以，通过"样式设置"功能调整字幕位置和大小。

### Q: 插件会影响 Eagle 性能吗？
A: 插件经过性能优化，对 Eagle 性能影响很小。

## 技术支持

- GitHub Issues: https://github.com/yourusername/eagle-subtitle-plugin/issues
- Email: your-email@example.com

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License