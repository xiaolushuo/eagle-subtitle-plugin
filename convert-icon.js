/**
 * Convert SVG icon to PNG
 * This script converts the SVG icon to PNG format for Eagle plugin compatibility
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (error) {
    console.log('Sharp not found. Please install it with: npm install sharp');
    console.log('Alternatively, you can convert the SVG manually using an online tool.');
    process.exit(1);
}

async function convertIcon() {
    const svgPath = path.join(__dirname, 'icon.svg');
    const pngPath = path.join(__dirname, 'icon.png');
    
    try {
        // Check if SVG file exists
        if (!fs.existsSync(svgPath)) {
            console.error('SVG icon file not found:', svgPath);
            return;
        }
        
        // Read SVG file
        const svgBuffer = fs.readFileSync(svgPath);
        
        // Convert to PNG
        await sharp(svgBuffer)
            .resize(256, 256)
            .png()
            .toFile(pngPath);
        
        console.log('✅ Icon converted successfully:', pngPath);
        console.log('📁 File size:', (fs.statSync(pngPath).size / 1024).toFixed(2) + ' KB');
        
    } catch (error) {
        console.error('❌ Error converting icon:', error);
    }
}

// Run conversion
convertIcon();