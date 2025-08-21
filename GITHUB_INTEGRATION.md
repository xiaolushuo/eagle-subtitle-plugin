# GitHub Integration Guide

## 📋 项目概述

本项目是一个完整的 Eagle 视频字幕插件，具有以下特点：

- **完整的功能实现**：支持 SRT、ASS、VTT 字幕格式
- **模块化设计**：代码结构清晰，易于维护和扩展
- **性能优化**：使用二分查找和缓存机制
- **用户友好**：提供直观的控制面板和快捷键
- **跨平台支持**：兼容 Windows、macOS、Linux

## 📁 项目结构

```
eagle-subtitle-plugin/
├── 📁 dist/                          # 构建输出目录
│   ├── manifest.json                 # 插件配置文件
│   ├── main.js                       # 主控制器
│   ├── overlay.html                 # 字幕覆盖层
│   ├── subtitle-parser.js           # 字幕解析器
│   ├── subtitle-sync.js             # 字幕同步器
│   ├── utils.js                     # 工具函数
│   ├── styles.css                   # 样式文件
│   ├── README.md                    # 使用说明
│   └── package-info.json            # 包信息
├── 📁 src/                          # 源代码（开发用）
│   ├── main.js                      # 主控制器源码
│   ├── overlay.html                # 覆盖层源码
│   ├── subtitle-parser.js          # 解析器源码
│   ├── subtitle-sync.js            # 同步器源码
│   ├── utils.js                    # 工具源码
│   └── styles.css                  # 样式源码
├── 🛠️ 开发工具
│   ├── build.js                     # 构建脚本
│   ├── test.js                      # 测试脚本
│   ├── deploy.js                    # 部署脚本
│   ├── convert-icon.js              # 图标转换脚本
│   └── create-release.sh            # GitHub 发布脚本
├── 📄 文档
│   ├── README.md                    # 主要文档
│   ├── INSTALL.md                   # 安装指南
│   ├── LICENSE                      # 许可证
│   ├── RELEASE_NOTES.md             # 发布说明
│   └── GITHUB_INTEGRATION.md       # GitHub 集成指南
├── ⚙️ 配置文件
│   ├── package.json                 # npm 配置
│   ├── manifest.json                # 插件清单
│   ├── .gitignore                  # Git 忽略文件
│   ├── .npmrc                      # npm 配置
│   └── icon.svg                    # SVG 图标
└── 🚀 部署相关
    └── .git/                       # Git 仓库
```

## 🎯 核心功能

### 1. 字幕解析器 (subtitle-parser.js)
- 支持 SRT、ASS、SSA、VTT 格式
- 自动格式检测
- 完整的错误处理
- 性能优化

### 2. 字幕同步器 (subtitle-sync.js)
- 高精度时间同步
- 二分查找算法
- 性能模式支持
- 实时调整功能

### 3. 主控制器 (main.js)
- Eagle API 集成
- 事件驱动架构
- 文件系统操作
- 窗口管理

### 4. 覆盖层 (overlay.html)
- 透明窗口实现
- 响应式设计
- 快捷键支持
- 样式自定义

### 5. 工具函数 (utils.js)
- 文件操作工具
- 时间格式化
- 防抖节流函数
- 验证工具

## 🚀 GitHub 部署步骤

### 1. 初始化 GitHub 仓库

```bash
# 1. 创建 GitHub 仓库
# 访问 https://github.com/new 创建新仓库

# 2. 添加远程仓库
git remote add origin https://github.com/yourusername/eagle-subtitle-plugin.git

# 3. 推送代码
git branch -M main
git push -u origin main
```

### 2. 创建 GitHub Release

```bash
# 方法一：使用脚本
chmod +x create-release.sh
./create-release.sh

# 方法二：手动创建
gh release create v1.0.0 --title "Eagle 字幕插件 v1.0.0" --notes-file RELEASE_NOTES.md dist/*
```

### 3. 设置 GitHub Pages（可选）

```bash
# 创建 gh-pages 分支
git checkout --orphan gh-pages
git rm -rf .
echo "# Eagle 字幕插件" > README.md
git add README.md
git commit -m "Initial GitHub Pages"
git push origin gh-pages
```

## 📦 发布管理

### 版本号管理
- 使用语义化版本号 (Semantic Versioning)
- 格式：MAJOR.MINOR.PATCH
- 示例：1.0.0, 1.0.1, 1.1.0

### 发布流程
1. 更新版本号 (package.json, manifest.json)
2. 更新 CHANGELOG.md
3. 创建新的发布说明
4. 运行测试
5. 构建项目
6. 创建 GitHub Release

### 发布检查清单
- [ ] 所有测试通过
- [ ] 文档更新
- [ ] 版本号正确
- [ ] 发布说明完整
- [ ] 构建文件完整
- [ ] 许可证文件正确

## 🧪 测试和质量保证

### 自动化测试
```bash
# 运行所有测试
npm test
# 或
node test.js
```

### 代码质量检查
- 使用 ESLint 进行代码检查
- 遵循 JavaScript 编码规范
- 模块化设计
- 完整的错误处理

### 性能测试
- 大字幕文件处理 (>1000 条)
- 内存使用监控
- 响应时间测试
- 跨平台兼容性

## 📊 项目统计

### 代码统计
- **总文件数**: 8 个核心文件
- **总代码行数**: ~1000 行
- **包大小**: ~61 KB
- **支持格式**: 4 种字幕格式

### 功能统计
- **核心功能**: 8 个主要功能
- **快捷键**: 4 个快捷键
- **支持平台**: 3 个平台
- **API 集成**: Eagle Plugin API

## 🤝 贡献指南

### 开发环境设置
```bash
# 克隆项目
git clone https://github.com/yourusername/eagle-subtitle-plugin.git
cd eagle-subtitle-plugin

# 安装依赖
npm install

# 开发模式
npm run start
```

### 贡献流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循现有代码风格
- 添加适当的注释
- 编写测试用例

## 📈 后续开发计划

### 短期目标
- [ ] 添加更多字幕格式支持
- [ ] 改进用户界面
- [ ] 增加批量处理功能
- [ ] 优化性能

### 长期目标
- [ ] 多语言支持
- [ ] 在线字幕下载
- [ ] 字幕编辑功能
- [ ] 云同步功能

### 社区建设
- [ ] 完善文档
- [ ] 建立用户社区
- [ ] 收集用户反馈
- [ ] 定期更新维护

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/yourusername/eagle-subtitle-plugin
- **Issues**: https://github.com/yourusername/eagle-subtitle-plugin/issues
- **Releases**: https://github.com/yourusername/eagle-subtitle-plugin/releases
- **Wiki**: https://github.com/yourusername/eagle-subtitle-plugin/wiki

## 📞 联系方式

- **维护者**: Your Name
- **邮箱**: your-email@example.com
- **GitHub**: @yourusername

---

**注意**: 本项目为开源项目，欢迎贡献代码和建议。请遵循项目的许可证条款和贡献指南。