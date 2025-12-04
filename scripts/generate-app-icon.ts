#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Generate PWA icons from GrBook SVG path
 * This script creates styled SVG and generates all required PWA icon sizes
 */

// GrBook icon SVG path data (from react-icons/gr)
const GRBOOK_PATH =
  'M10,1 L10,11 L13,9 L16,11 L16,1 M5.5,18 C4.11928813,18 3,19.1192881 3,20.5 C3,21.8807119 4.11928813,23 5.5,23 L22,23 M3,20.5 L3,3.5 C3,2.11928813 4.11928813,1 5.5,1 L21,1 L21,18.0073514 L5.49217286,18.0073514 M20.5,18 C19.1192881,18 18,19.1192881 18,20.5 C18,21.8807119 19.1192881,23 20.5,23 L20.5,23';

// Color scheme matching the app's theme
const COLORS = {
  background: '#fff', // Tailwind blue-500
  foreground: '#222', // # gray-900
  theme: '#3b82f6', // Matches brand color
};

/**
 * Create styled SVG with the GrBook icon
 */
function createStyledSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
  <rect width="24" height="24" fill="${COLORS.background}"/>
  <path fill="none" stroke="${COLORS.foreground}" stroke-width="2" 
        d="${GRBOOK_PATH}"
        transform="translate(0.5, 0.5)"/>
</svg>`;
}

/**
 * Generate favicon SVG
 */
function createFaviconSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
  <rect width="24" height="24" fill="${COLORS.background}"/>
  <path fill="none" stroke="${COLORS.foreground}" stroke-width="2" 
        d="${GRBOOK_PATH}"
        transform="translate(0.5, 0.5)"/>
</svg>`;
}

/**
 * Create ICO format data for favicon (multiple sizes)
 * This is a simplified version - in a real implementation, you'd use a library like 'pngjs' or 'jimp'
 */
async function createFaviconIco(): Promise<Buffer> {
  // For now, we'll create a simple placeholder
  // In a real implementation, you'd generate actual ICO format with multiple sizes
  console.warn('⚠️  ICO generation is simplified - consider using a proper ICO generation library');

  // Create a simple 32x32 PNG-like buffer (placeholder)
  const icoBuffer = Buffer.alloc(128);
  icoBuffer.write('ICO', 0, 3, 'ascii');
  return icoBuffer;
}

/**
 * Generate all required icon sizes from the source SVG
 */
async function generateIcons(): Promise<void> {
  const publicDir = join(process.cwd(), 'public');
  const iconsDir = join(publicDir, 'icons');

  // Ensure directories exist
  await fs.mkdir(iconsDir, { recursive: true });

  console.log('🎨 Generating PWA icons...');

  // Create source SVG
  const sourceSvg = createStyledSvg();
  const sourcePath = join(publicDir, 'icon-source.svg');
  await fs.writeFile(sourcePath, sourceSvg);
  console.log('✅ Created source SVG:', sourcePath);

  // Create favicon SVG
  const faviconSvg = createFaviconSvg();
  const faviconSvgPath = join(iconsDir, 'favicon.svg');
  await fs.writeFile(faviconSvgPath, faviconSvg);
  console.log('✅ Created favicon SVG:', faviconSvgPath);

  // Create favicon ICO (placeholder)
  const faviconIcoBuffer = await createFaviconIco();
  const faviconIcoPath = join(iconsDir, 'favicon.ico');
  await fs.writeFile(faviconIcoPath, faviconIcoBuffer);
  console.log('✅ Created favicon ICO:', faviconIcoPath);

  // Generate PNG icons using a simple approach
  // Note: In a real implementation, you'd use a proper SVG to PNG conversion library
  // For now, we'll create placeholder files and log instructions

  const iconSizes = [
    { size: 192, name: 'pwa-192x192.png' },
    { size: 512, name: 'pwa-512x512.png' },
    { size: 384, name: 'pwa-384x384.png' },
    { size: 256, name: 'pwa-256x256.png' },
    { size: 180, name: 'apple-touch-icon-180x180.png' },
  ];

  for (const { size, name } of iconSizes) {
    const iconPath = join(iconsDir, name);
    // Create a simple placeholder PNG (1x1 pixel)
    // In a real implementation, you'd convert the SVG to PNG at the correct size
    const placeholderPng = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d,
      0x49,
      0x48,
      0x44,
      0x52, // IHDR chunk start
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01, // 1x1 pixel
      0x08,
      0x02,
      0x00,
      0x00,
      0x00,
      0x90,
      0x77,
      0x53,
      0xde, // bit depth, color type, etc.
      0x00,
      0x00,
      0x00,
      0x0c,
      0x49,
      0x44,
      0x41,
      0x54, // IDAT chunk start
      0x08,
      0x99,
      0x01,
      0x01,
      0x00,
      0x00,
      0x00,
      0xff,
      0xff,
      0x00,
      0x00,
      0x00,
      0x02,
      0x00,
      0x01, // compressed data
      0x00,
      0x00,
      0x00,
      0x00,
      0x49,
      0x45,
      0x4e,
      0x44,
      0xae,
      0x42,
      0x60,
      0x82, // IEND chunk
    ]);

    await fs.writeFile(iconPath, placeholderPng);
    console.log(`✅ Created placeholder ${size}x${size} PNG:`, iconPath);
  }

  console.log('\n🎉 Icon generation completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Install a proper SVG to PNG conversion library (like sharp or jimp)');
  console.log('2. Update this script to generate actual PNG files from the SVG');
  console.log('3. Run the PWA build process to complete the setup');

  console.log('\n🔧 For now, you can manually convert the source SVG to PNG files:');
  console.log('   Source SVG:', sourcePath);
  console.log('   Required sizes:', iconSizes.map((s) => s.size + 'x' + s.size).join(', '));
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    await generateIcons();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});

export { createStyledSvg, createFaviconSvg, generateIcons };
