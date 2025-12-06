#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Generate PWA icons from GrBook SVG path
 * This script creates styled SVG and generates all required PWA icon sizes
 */

// load svg config from src/assets/logo.svg via nodejs api
const logoSvg = await fs.readFile(join(process.cwd(), 'src/assets/logo.svg'), 'utf-8');

/**
 * Create styled SVG with the GrBook icon
 */
const createStyledSvg = () => logoSvg;

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
  const faviconSvg = logoSvg;
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

  const iconSizes = [];

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

export { generateIcons };
