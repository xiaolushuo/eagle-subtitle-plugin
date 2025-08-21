/**
 * Eagle Subtitle Plugin - Subtitle Parser
 * Parser for various subtitle formats (SRT, ASS, VTT)
 */

// Make parser available globally
window.SubtitleParser = function() {
    this.parsers = {
        'srt': this.parseSRT.bind(this),
        'ass': this.parseASS.bind(this),
        'ssa': this.parseASS.bind(this), // SSA format is similar to ASS
        'vtt': this.parseVTT.bind(this)
    };
};

/**
 * Main parsing method
 */
window.SubtitleParser.prototype.parse = function(content, format) {
    if (!content || !format) {
        throw new Error('Subtitle content and format are required');
    }
    
    const parser = this.parsers[format.toLowerCase()];
    if (!parser) {
        throw new Error(`Unsupported subtitle format: ${format}`);
    }
    
    try {
        const subtitles = parser(content);
        console.log(`✅ Successfully parsed ${subtitles.length} subtitles`);
        return subtitles;
    } catch (error) {
        console.error(`❌ Failed to parse ${format} format subtitles:`, error);
        throw error;
    }
};

/**
 * Parse SRT format
 */
window.SubtitleParser.prototype.parseSRT = function(content) {
    const lines = content.split('\n');
    const subtitles = [];
    let currentSubtitle = null;
    let lineIndex = 0;
    
    while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        
        if (line && !isNaN(line)) {
            // Sequence number line
            if (currentSubtitle) {
                subtitles.push(currentSubtitle);
            }
            
            currentSubtitle = {
                index: parseInt(line),
                startTime: 0,
                endTime: 0,
                text: ''
            };
            
            // Next line is timestamp
            lineIndex++;
            const timeLine = lines[lineIndex].trim();
            const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
            
            if (timeMatch) {
                currentSubtitle.startTime = this.parseSRTTime(timeMatch[1]);
                currentSubtitle.endTime = this.parseSRTTime(timeMatch[2]);
            }
            
            lineIndex++;
            
            // Read subtitle text
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
};

/**
 * Parse SRT time format
 */
window.SubtitleParser.prototype.parseSRTTime = function(timeStr) {
    const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const milliseconds = parseInt(match[4]);
        
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    return 0;
};

/**
 * Parse ASS format
 */
window.SubtitleParser.prototype.parseASS = function(content) {
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
            // Parse format line to determine field order
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
};

/**
 * Parse ASS dialogue line
 */
window.SubtitleParser.prototype.parseASSDialogue = function(line) {
    // Remove "Dialogue:" prefix
    const dialogueContent = line.substring(9);
    const parts = dialogueContent.split(',');
    
    // ASS format typically has at least 10 fields
    if (parts.length >= 10) {
        // Field order: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
        return {
            startTime: this.parseASSTime(parts[1]),
            endTime: this.parseASSTime(parts[2]),
            text: parts.slice(9).join(',').replace(/\\N/g, '\n')
        };
    }
    return null;
};

/**
 * Parse ASS time format
 */
window.SubtitleParser.prototype.parseASSTime = function(timeStr) {
    // Support H:MM:SS.mm format
    const match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\.(\d{2})/);
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const centiseconds = parseInt(match[4]);
        
        return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
    }
    return 0;
};

/**
 * Parse VTT format
 */
window.SubtitleParser.prototype.parseVTT = function(content) {
    const lines = content.split('\n');
    const subtitles = [];
    let currentSubtitle = null;
    let lineIndex = 0;
    
    // Skip WEBVTT header and metadata
    while (lineIndex < lines.length && !lines[lineIndex].includes('-->')) {
        lineIndex++;
    }
    
    while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();
        
        if (line.includes('-->')) {
            if (currentSubtitle) {
                subtitles.push(currentSubtitle);
            }
            
            // VTT time format: HH:MM:SS.mmm --> HH:MM:SS.mmm
            const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
            if (timeMatch) {
                currentSubtitle = {
                    startTime: this.parseVTTTime(timeMatch[1]),
                    endTime: this.parseVTTTime(timeMatch[2]),
                    text: ''
                };
            }
            
            lineIndex++;
            
            // Read subtitle text
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
};

/**
 * Parse VTT time format
 */
window.SubtitleParser.prototype.parseVTTTime = function(timeStr) {
    const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const milliseconds = parseInt(match[4]);
        
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    return 0;
};

/**
 * Validate subtitle format
 */
window.SubtitleParser.prototype.validateFormat = function(content, format) {
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
};

/**
 * Validate SRT format
 */
window.SubtitleParser.prototype.validateSRT = function(content) {
    return content.includes('-->') && /\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(content);
};

/**
 * Validate ASS format
 */
window.SubtitleParser.prototype.validateASS = function(content) {
    return content.includes('[V4+ Styles]') && content.includes('[Events]') && content.includes('Dialogue:');
};

/**
 * Validate VTT format
 */
window.SubtitleParser.prototype.validateVTT = function(content) {
    return content.startsWith('WEBVTT') && content.includes('-->');
};

/**
 * Auto detect subtitle format
 */
window.SubtitleParser.prototype.detectFormat = function(content) {
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
};

/**
 * Parse subtitle (auto detect format)
 */
window.SubtitleParser.prototype.parseAuto = function(content) {
    const format = this.detectFormat(content);
    if (!format) {
        throw new Error('Unable to detect subtitle format');
    }
    
    return this.parse(content, format);
};

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.SubtitleParser;
}