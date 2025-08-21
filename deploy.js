/**
 * GitHub deployment script
 * This script helps prepare the plugin for GitHub release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubDeployer {
    constructor() {
        this.pluginDir = __dirname;
        this.distDir = path.join(__dirname, 'dist');
        this.version = '1.0.0';
        this.repoName = 'eagle-subtitle-plugin';
    }

    async deploy() {
        console.log('🚀 Preparing for GitHub deployment...\n');
        
        try {
            // Check if git is initialized
            await this.checkGitStatus();
            
            // Build the plugin
            await this.buildPlugin();
            
            // Create release notes
            await this.createReleaseNotes();
            
            // Create GitHub release script
            await this.createReleaseScript();
            
            console.log('✅ GitHub deployment preparation completed!');
            console.log('📋 Next steps:');
            console.log('   1. Commit your changes: git add . && git commit -m "Release v1.0.0"');
            console.log('   2. Push to GitHub: git push origin main');
            console.log('   3. Create release: npm run create-release');
            
        } catch (error) {
            console.error('❌ Deployment preparation failed:', error);
            process.exit(1);
        }
    }

    async checkGitStatus() {
        console.log('🔍 Checking git status...');
        
        try {
            // Check if .git exists
            const gitDir = path.join(this.pluginDir, '.git');
            if (!fs.existsSync(gitDir)) {
                console.log('📦 Initializing git repository...');
                execSync('git init', { cwd: this.pluginDir });
            }
            
            // Check git status
            const status = execSync('git status --porcelain', { cwd: this.pluginDir, encoding: 'utf8' });
            if (status.trim()) {
                console.log('⚠️ You have uncommitted changes:');
                console.log(status);
                console.log('Please commit or stash them before deployment.');
            } else {
                console.log('✅ Git repository is clean');
            }
            
        } catch (error) {
            console.error('❌ Git check failed:', error.message);
            throw error;
        }
    }

    async buildPlugin() {
        console.log('🔨 Building plugin...');
        
        // Run build script
        execSync('node build.js', { cwd: this.pluginDir, stdio: 'inherit' });
        
        console.log('✅ Plugin built successfully');
    }

    async createReleaseNotes() {
        console.log('📝 Creating release notes...');
        
        const releaseNotes = `# Eagle 字幕插件 v${this.version}

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
   - Windows: \`%APPDATA%\\Eagle\\plugins\\\`
   - macOS: \`~/Library/Application Support/Eagle/plugins/\`
   - Linux: \`~/.config/Eagle/plugins/\`
3. 重启 Eagle 应用
4. 在 Eagle 中启用插件

## 🎯 使用方法
1. 在 Eagle 中选择视频文件
2. 确保视频文件同目录下有同名字幕文件
3. 播放视频，字幕会自动显示

## ⌨️ 快捷键
- \`H\` - 显示/隐藏字幕
- \`O\` - 调整时间偏移
- \`S\` - 更改字幕样式
- \`ESC\` - 隐藏控制面板

## 🐛 修复内容
- 修复了字幕时间同步的精度问题
- 优化了大量字幕文件的处理性能
- 改进了字幕样式的渲染效果
- 增强了错误处理和日志记录

## 📋 文件清单
${this.getFileList()}

## 🔧 系统要求
- Eagle 应用 (最新版本)
- Node.js >= 14.0.0 (用于开发)
- 支持的操作系统：Windows 10+, macOS 10.14+, Linux

## 📄 许可证
MIT License

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

## 📞 支持
- GitHub Issues: https://github.com/yourusername/${this.repoName}/issues
- Email: your-email@example.com

---

**注意**：本插件为第三方开发，与 Eagle 官方无关。使用前请确保符合 Eagle 的使用条款。`;

        const releaseNotesPath = path.join(this.pluginDir, 'RELEASE_NOTES.md');
        fs.writeFileSync(releaseNotesPath, releaseNotes);
        
        console.log('✅ Release notes created');
    }

    getFileList() {
        const files = fs.readdirSync(this.distDir);
        let fileList = '';
        
        files.forEach(file => {
            const filePath = path.join(this.distDir, file);
            const stats = fs.statSync(filePath);
            fileList += `- \`${file}\` (${(stats.size / 1024).toFixed(2)} KB)\n`;
        });
        
        return fileList;
    }

    async createReleaseScript() {
        console.log('📜 Creating release script...');
        
        const scriptContent = `#!/bin/bash

# GitHub Release Script for Eagle Subtitle Plugin

echo "🚀 Creating GitHub release..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Please login to GitHub first:"
    echo "gh auth login"
    exit 1
fi

# Variables
VERSION="1.0.0"
TITLE="Eagle 字幕插件 v$VERSION"
FILES=(dist/*.js dist/*.html dist/*.css dist/*.json dist/*.md)

# Create release
echo "📦 Creating release v$VERSION..."
gh release create "v$VERSION" \\
    --title "$TITLE" \\
    --notes-file "RELEASE_NOTES.md" \\
    "\${FILES[@]}"

echo "✅ Release created successfully!"
echo "🔗 View release at: https://github.com/yourusername/${this.repoName}/releases/tag/v$VERSION"
`;

        const scriptPath = path.join(this.pluginDir, 'create-release.sh');
        fs.writeFileSync(scriptPath, scriptContent);
        
        // Make script executable
        try {
            execSync(`chmod +x "${scriptPath}"`);
        } catch (error) {
            // Ignore chmod errors on Windows
        }
        
        console.log('✅ Release script created');
    }
}

// Run deployment preparation
const deployer = new GitHubDeployer();
deployer.deploy();