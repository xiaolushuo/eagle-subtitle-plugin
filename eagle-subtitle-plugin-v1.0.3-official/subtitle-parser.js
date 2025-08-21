/**
 * 字幕解析器
 * 支持 SRT、ASS、VTT 格式
 */
class SubtitleParser {
    constructor() {
        this.parsers = {
            'srt': this.parseSRT.bind(this),
            'ass': this.parseASS.bind(this),
            'ssa': this.parseASS.bind(this), // SSA 格式与 ASS 类似
            'vtt': this.parseVTT.bind(this)
        };
    }
    
    // 主解析方法
    parse(content, format) {
        if (!content || !format) {
            throw new Error('字幕内容和格式不能为空');
        }
        
        const parser = this.parsers[format.toLowerCase()];
        if (!parser) {
            throw new Error(`不支持的字幕格式: ${format}`);
        }
        
        try {
            const subtitles = parser(content);
            console.log(`✅ 成功解析 ${subtitles.length} 条字幕`);
            return subtitles;
        } catch (error) {
            console.error(`❌ 解析 ${format} 格式字幕失败:`, error);
            throw error;
        }
    }
    
    // 解析 SRT 格式
    parseSRT(content) {
        const lines = content.split('\n');
        const subtitles = [];
        let currentSubtitle = null;
        let lineIndex = 0;
        
        while (lineIndex < lines.length) {
            const line = lines[lineIndex].trim();
            
            if (line && !isNaN(line)) {
                // 序号行
                if (currentSubtitle) {
                    subtitles.push(currentSubtitle);
                }
                
                currentSubtitle = {
                    index: parseInt(line),
                    startTime: 0,
                    endTime: 0,
                    text: ''
                };
                
                // 下一行是时间轴
                lineIndex++;
                const timeLine = lines[lineIndex].trim();
                const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
                
                if (timeMatch) {
                    currentSubtitle.startTime = this.parseSRTTime(timeMatch[1]);
                    currentSubtitle.endTime = this.parseSRTTime(timeMatch[2]);
                }
                
                lineIndex++;
                
                // 读取字幕文本
                while (lineIndex < lines.length && lines[lineIndex].trim() !== '') {
                    currentSubtitle.text += lines[lineIndex] + '\n';
                    lineIndex++;
                }
                
                currentSubtitle.text = currentSubtitle.text.trim();
            }
            
            lineIndex++;
        }
        
        if (currentSubtitle) {
            subtitles.push(currentSubtitle);
        }
        
        return subtitles;
    }
    
    // 解析 SRT 时间格式
    parseSRTTime(timeStr) {
        const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const milliseconds = parseInt(match[4]);
            
            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        }
        return 0;
    }
    
    // 解析 ASS/SSA 格式
    parseASS(content) {
        const lines = content.split('\n');
        const subtitles = [];
        let inEventsSection = false;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '[Events]') {
                inEventsSection = true;
                continue;
            }
            
            if (inEventsSection && trimmedLine.startsWith('Format:')) {
                // 解析格式行，确定字段顺序
                continue;
            }
            
            if (inEventsSection && trimmedLine.startsWith('Dialogue:')) {
                const dialogue = this.parseASSDialogue(trimmedLine);
                if (dialogue) {
                    subtitles.push(dialogue);
                }
            }
        }
        
        return subtitles;
    }
    
    // 解析 ASS 对话行
    parseASSDialogue(line) {
        // 移除 "Dialogue:" 前缀
        const dialogueContent = line.substring(9);
        const parts = dialogueContent.split(',');
        
        // ASS 格式通常有至少 10 个字段
        if (parts.length >= 10) {
            // 字段顺序：Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
            return {
                startTime: this.parseASSTime(parts[1]),
                endTime: this.parseASSTime(parts[2]),
                text: parts.slice(9).join(',').replace(/\\N/g, '\n')
            };
        }
        return null;
    }
    
    // 解析 ASS 时间格式
    parseASSTime(timeStr) {
        // 支持 H:MM:SS.mm 格式
        const match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\.(\d{2})/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const centiseconds = parseInt(match[4]);
            
            return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
        }
        return 0;
    }
    
    // 解析 VTT 格式
    parseVTT(content) {
        const lines = content.split('\n');
        const subtitles = [];
        let currentSubtitle = null;
        let lineIndex = 0;
        
        // 跳过 WEBVTT 头和元数据
        while (lineIndex < lines.length && !lines[lineIndex].includes('-->')) {
            lineIndex++;
        }
        
        while (lineIndex < lines.length) {
            const line = lines[lineIndex].trim();
            
            if (line.includes('-->')) {
                if (currentSubtitle) {
                    subtitles.push(currentSubtitle);
                }
                
                // VTT 时间格式：HH:MM:SS.mmm --> HH:MM:SS.mmm
                const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
                if (timeMatch) {
                    currentSubtitle = {
                        startTime: this.parseVTTTime(timeMatch[1]),
                        endTime: this.parseVTTTime(timeMatch[2]),
                        text: ''
                    };
                }
                
                lineIndex++;
                
                // 读取字幕文本
                while (lineIndex < lines.length && lines[lineIndex].trim() !== '') {
                    currentSubtitle.text += lines[lineIndex] + '\n';
                    lineIndex++;
                }
                
                currentSubtitle.text = currentSubtitle.text.trim();
            }
            
            lineIndex++;
        }
        
        if (currentSubtitle) {
            subtitles.push(currentSubtitle);
        }
        
        return subtitles;
    }
    
    // 解析 VTT 时间格式
    parseVTTTime(timeStr) {
        const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const milliseconds = parseInt(match[4]);
            
            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        }
        return 0;
    }
    
    // 验证字幕格式
    validateFormat(content, format) {
        switch (format.toLowerCase()) {
            case 'srt':
                return this.validateSRT(content);
            case 'ass':
            case 'ssa':
                return this.validateASS(content);
            case 'vtt':
                return this.validateVTT(content);
            default:
                return false;
        }
    }
    
    // 验证 SRT 格式
    validateSRT(content) {
        return content.includes('-->') && /\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(content);
    }
    
    // 验证 ASS 格式
    validateASS(content) {
        return content.includes('[V4+ Styles]') && content.includes('[Events]') && content.includes('Dialogue:');
    }
    
    // 验证 VTT 格式
    validateVTT(content) {
        return content.startsWith('WEBVTT') && content.includes('-->');
    }
    
    // 自动检测字幕格式
    detectFormat(content) {
        if (content.startsWith('WEBVTT')) {
            return 'vtt';
        }
        
        if (content.includes('[V4+ Styles]') && content.includes('[Events]')) {
            return 'ass';
        }
        
        if (content.includes('-->') && /\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(content)) {
            return 'srt';
        }
        
        return null;
    }
    
    // 解析字幕（自动检测格式）
    parseAuto(content) {
        const format = this.detectFormat(content);
        if (!format) {
            throw new Error('无法检测字幕格式');
        }
        
        return this.parse(content, format);
    }
}

// 导出解析器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SubtitleParser;
}