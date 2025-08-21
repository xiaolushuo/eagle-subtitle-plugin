/**
 * Plugin test script
 * This script validates the plugin structure and functionality
 */

const fs = require('fs');
const path = require('path');

class PluginTester {
    constructor() {
        this.pluginDir = __dirname;
        this.testResults = [];
        this.requiredFiles = [
            'manifest.json',
            'main.js',
            'overlay.html',
            'subtitle-parser.js',
            'subtitle-sync.js',
            'utils.js',
            'styles.css',
            'README.md'
        ];
    }

    async runTests() {
        console.log('🧪 Running plugin tests...\n');
        
        try {
            // Test file structure
            await this.testFileStructure();
            
            // Test manifest
            await this.testManifest();
            
            // Test main.js
            await this.testMainJs();
            
            // Test overlay.html
            await this.testOverlayHtml();
            
            // Test subtitle parser
            await this.testSubtitleParser();
            
            // Test subtitle sync
            await this.testSubtitleSync();
            
            // Test utils
            await this.testUtils();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            process.exit(1);
        }
    }

    async testFileStructure() {
        console.log('📁 Testing file structure...');
        
        for (const file of this.requiredFiles) {
            const filePath = path.join(this.pluginDir, file);
            const exists = fs.existsSync(filePath);
            
            this.addTestResult(`File exists: ${file}`, exists);
            
            if (exists) {
                const stats = fs.statSync(filePath);
                this.addTestResult(`File size: ${file} (${(stats.size / 1024).toFixed(2)} KB)`, stats.size > 0);
            }
        }
        
        // Check for optional files
        const optionalFiles = ['icon.png', 'icon.svg', 'LICENSE'];
        for (const file of optionalFiles) {
            const filePath = path.join(this.pluginDir, file);
            const exists = fs.existsSync(filePath);
            if (exists) {
                this.addTestResult(`Optional file exists: ${file}`, true);
            }
        }
        
        console.log('✅ File structure test completed\n');
    }

    async testManifest() {
        console.log('📋 Testing manifest.json...');
        
        const manifestPath = path.join(this.pluginDir, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Required fields
        const requiredFields = ['name', 'version', 'description', 'main'];
        for (const field of requiredFields) {
            this.addTestResult(`Manifest has ${field}`, !!manifest[field]);
        }
        
        // Check main file exists
        const mainPath = path.join(this.pluginDir, manifest.main);
        this.addTestResult(`Main file exists: ${manifest.main}`, fs.existsSync(mainPath));
        
        // Check permissions
        if (manifest.permissions) {
            this.addTestResult('Has permissions', Array.isArray(manifest.permissions));
            this.addTestResult('Has required permissions', 
                manifest.permissions.includes('fileSystem') && 
                manifest.permissions.includes('item') &&
                manifest.permissions.includes('player')
            );
        }
        
        console.log('✅ Manifest test completed\n');
    }

    async testMainJs() {
        console.log('🔧 Testing main.js...');
        
        const mainPath = path.join(this.pluginDir, 'main.js');
        const content = fs.readFileSync(mainPath, 'utf8');
        
        // Check for required imports
        this.addTestResult('Imports utils', content.includes("require('./utils.js')"));
        this.addTestResult('Imports parser', content.includes("require('./subtitle-parser.js')"));
        this.addTestResult('Imports sync', content.includes("require('./subtitle-sync.js')"));
        
        // Check for main functions
        const requiredFunctions = ['initialize', 'setupEventListeners', 'handleFileSelection', 'loadSubtitlesForVideo'];
        for (const func of requiredFunctions) {
            this.addTestResult(`Has function: ${func}`, content.includes(func));
        }
        
        // Check for Eagle API usage
        this.addTestResult('Uses eagle.onPluginCreate', content.includes('eagle.onPluginCreate'));
        this.addTestResult('Uses eagle.player', content.includes('eagle.player'));
        
        console.log('✅ Main.js test completed\n');
    }

    async testOverlayHtml() {
        console.log('🌐 Testing overlay.html...');
        
        const overlayPath = path.join(this.pluginDir, 'overlay.html');
        const content = fs.readFileSync(overlayPath, 'utf8');
        
        // Check for HTML structure
        this.addTestResult('Has HTML doctype', content.includes('<!DOCTYPE html>'));
        this.addTestResult('Has subtitle container', content.includes('id="subtitleContainer"'));
        this.addTestResult('Has subtitle text', content.includes('id="subtitleText"'));
        this.addTestResult('Has control panel', content.includes('id="controlPanel"'));
        
        // Check for JavaScript
        this.addTestResult('Has electron require', content.includes('require(\'electron\')'));
        this.addTestResult('Has IPC listeners', content.includes('ipcRenderer.on'));
        
        // Check for CSS
        this.addTestResult('Has embedded CSS', content.includes('<style>'));
        this.addTestResult('Has responsive design', content.includes('@media'));
        
        console.log('✅ Overlay.html test completed\n');
    }

    async testSubtitleParser() {
        console.log('📝 Testing subtitle-parser.js...');
        
        const parserPath = path.join(this.pluginDir, 'subtitle-parser.js');
        const content = fs.readFileSync(parserPath, 'utf8');
        
        // Check for parser class
        this.addTestResult('Has SubtitleParser class', content.includes('class SubtitleParser'));
        
        // Check for format support
        this.addTestResult('Supports SRT', content.includes('parseSRT'));
        this.addTestResult('Supports ASS', content.includes('parseASS'));
        this.addTestResult('Supports VTT', content.includes('parseVTT'));
        
        // Check for required methods
        const requiredMethods = ['parse', 'validateFormat', 'detectFormat'];
        for (const method of requiredMethods) {
            this.addTestResult(`Has method: ${method}`, content.includes(method));
        }
        
        console.log('✅ Subtitle parser test completed\n');
    }

    async testSubtitleSync() {
        console.log('⏰ Testing subtitle-sync.js...');
        
        const syncPath = path.join(this.pluginDir, 'subtitle-sync.js');
        const content = fs.readFileSync(syncPath, 'utf8');
        
        // Check for sync class
        this.addTestResult('Has SubtitleSync class', content.includes('class SubtitleSync'));
        
        // Check for required methods
        const requiredMethods = ['loadSubtitles', 'startSync', 'stopSync', 'setCurrentTime'];
        for (const method of requiredMethods) {
            this.addTestResult(`Has method: ${method}`, content.includes(method));
        }
        
        // Check for performance features
        this.addTestResult('Has performance mode', content.includes('performanceMode'));
        this.addTestResult('Has binary search algorithm', content.includes('Math.floor((left + right) / 2)'));
        
        console.log('✅ Subtitle sync test completed\n');
    }

    async testUtils() {
        console.log('🛠️ Testing utils.js...');
        
        const utilsPath = path.join(this.pluginDir, 'utils.js');
        const content = fs.readFileSync(utilsPath, 'utf8');
        
        // Check for utils class
        this.addTestResult('Has SubtitleUtils class', content.includes('class SubtitleUtils'));
        
        // Check for required methods
        const requiredMethods = ['getSubtitlePath', 'formatTime', 'fileExists', 'isVideoFile'];
        for (const method of requiredMethods) {
            this.addTestResult(`Has method: ${method}`, content.includes(method));
        }
        
        // Check for utility functions
        this.addTestResult('Has debounce function', content.includes('debounce'));
        this.addTestResult('Has throttle function', content.includes('throttle'));
        
        console.log('✅ Utils test completed\n');
    }

    addTestResult(description, passed) {
        this.testResults.push({
            description,
            passed,
            timestamp: new Date().toISOString()
        });
    }

    displayResults() {
        console.log('📊 Test Results:\n');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        const total = this.testResults.length;
        
        console.log(`Total tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%\n`);
        
        if (failed > 0) {
            console.log('❌ Failed tests:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`  - ${r.description}`);
                });
            console.log('');
        }
        
        if (failed === 0) {
            console.log('🎉 All tests passed! Plugin is ready for use.\n');
        } else {
            console.log('⚠️ Some tests failed. Please fix the issues before using the plugin.\n');
            process.exit(1);
        }
    }
}

// Run tests
const tester = new PluginTester();
tester.runTests();