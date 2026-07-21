const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Source image path:
//   1. CLI 参数：npm run generate-icons -- /path/to/icon.png
//   2. 项目内默认：assets/source-icon.png
//   3. 环境变量：ICON_SOURCE=/path/to/icon.png
const sourceImage = process.argv[2]
  || process.env.ICON_SOURCE
  || path.join(__dirname, '..', 'assets', 'source-icon.png');

if (!fs.existsSync(sourceImage)) {
  console.error(`[generate-icons] 源图片不存在: ${sourceImage}`);
  console.error('  用法: npm run generate-icons -- /path/to/icon.png');
  console.error('  或将图片放到 assets/source-icon.png');
  process.exit(1);
}

// Android mipmap sizes
const androidSizes = [
    { name: 'mipmap-mdpi', size: 48 },
    { name: 'mipmap-hdpi', size: 72 },
    { name: 'mipmap-xhdpi', size: 96 },
    { name: 'mipmap-xxhdpi', size: 144 },
    { name: 'mipmap-xxxhdpi', size: 192 },
];

// Adaptive icon foreground sizes (should be 108dp at each density, with safe zone)
const foregroundSizes = [
    { name: 'mipmap-mdpi', size: 108 },
    { name: 'mipmap-hdpi', size: 162 },
    { name: 'mipmap-xhdpi', size: 216 },
    { name: 'mipmap-xxhdpi', size: 324 },
    { name: 'mipmap-xxxhdpi', size: 432 },
];

const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const iosAssetsDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

async function generateIcons() {
    console.log('Generating Android app icons...');

    for (const { name, size } of androidSizes) {
        const outputDir = path.join(resDir, name);

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate ic_launcher.png
        await sharp(sourceImage)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, 'ic_launcher.png'));
        console.log(`Created ${name}/ic_launcher.png (${size}x${size})`);

        // Generate ic_launcher_round.png (same as launcher for this square image)
        await sharp(sourceImage)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, 'ic_launcher_round.png'));
        console.log(`Created ${name}/ic_launcher_round.png (${size}x${size})`);
    }

    // Generate foreground icons for adaptive icons
    for (const { name, size } of foregroundSizes) {
        const outputDir = path.join(resDir, name);

        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate ic_launcher_foreground.png with padding for safe zone
        // The icon content should be in the center 66dp (72dp - 6dp padding on each side)
        const iconSize = Math.round(size * 0.72); // Safe zone is about 72% of total
        const padding = Math.round((size - iconSize) / 2);

        await sharp(sourceImage)
            .resize(iconSize, iconSize)
            .extend({
                top: padding,
                bottom: padding,
                left: padding,
                right: padding,
                background: { r: 238, g: 238, b: 236, alpha: 1 } // Match the background color from the image
            })
            .png()
            .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));
        console.log(`Created ${name}/ic_launcher_foreground.png (${size}x${size})`);
    }

    console.log('\n--- Generating iOS app icons... ---');

    // Ensure iOS assets directory exists
    if (!fs.existsSync(iosAssetsDir)) {
        fs.mkdirSync(iosAssetsDir, { recursive: true });
    }

    // Generate iOS App Icon (1024x1024)
    await sharp(sourceImage)
        .resize(1024, 1024)
        .png()
        .toFile(path.join(iosAssetsDir, 'AppIcon-512@2x.png'));
    console.log('Created iOS AppIcon-512@2x.png (1024x1024)');

    console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);

