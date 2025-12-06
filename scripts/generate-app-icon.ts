#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Generate PWA icons from GrBook SVG path
 * This script creates styled SVG and generates all required PWA icon sizes
 */

const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" id="shiro-svg" width="300" height="300" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#ffffff" />
  <g id="shiro-lines" stroke="black" stroke-width="10" fill="none" class="sketch-stroke">
    <path
      d="M 70 90 Q 40 70 30 100 Q 25 120 70 125"
      fill="white"
      class="fill-area"
    />
    <path
      d="M 330 110 Q 370 90 390 120 Q 400 150 370 150 Q 350 150 330 130"
      fill="white"
      class="fill-area"
    />
    <path
      d="M 280 340 Q 310 320 330 330 Q 350 340 340 360 Q 320 380 300 370 Q 290 360 270 360"
      fill="white"
      class="fill-area"
    />
    <path
      d="M 140 260 Q 130 300 120 350 Q 110 380 150 380 L 170 380 Q 175 340 200 340
      Q 225 340 230 380 L 250 380 Q 290 380 280 340 Q 270 300 260 260"
      fill="white"
      stroke-linejoin="round"
      class="fill-area"
    />
    <path
      d="M 80 120 Q 70 80 100 60 Q 130 40 160 50 Q 190 30 220 50 Q 260 40 290 70
      Q 330 90 320 140 Q 340 180 310 210 Q 330 250 280 260 Q 240 280 200 270
      Q 150 280 110 250 Q 70 230 80 180 Q 60 140 80 120"
      fill="white"
      class="fill-area"
    />
    <path d="M 100 100 Q 120 70 150 100" fill="none" />
    <path d="M 250 110 Q 280 90 310 120" fill="none" />
    <circle cx="130" cy="140" r="7" fill="black" stroke="none" class="eye-fill" />
    <circle cx="270" cy="150" r="7" fill="black" stroke="none" class="eye-fill" />
    <path
      d="M 170 180 Q 190 170 210 180 Q 230 190 220 185 Q 200 195 170 180"
      fill="black"
      class="mouth-fill"
    />
    <g id="blush-lines" stroke="#ff8888" stroke-width="3">
      <line x1="280" y1="190" x2="270" y2="210" />
      <line x1="295" y1="195" x2="285" y2="215" />
      <line x1="310" y1="200" x2="300" y2="220" />
    </g>
  </g>
</svg>
`;

/**
 * Create styled SVG with the GrBook icon
 */
function createStyledSvg(): string {
  //   return `<?xml version="1.0" encoding="UTF-8"?>
  // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512">
  //   <rect width="24" height="24" fill="${COLORS.background}"/>
  //   <path fill="none" stroke="${COLORS.foreground}" stroke-width="2"
  //         d="${GRBOOK_PATH}"
  //         transform="translate(0.5, 0.5)"/>
  // </svg>`;
  return logoSvg;
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

export { generateIcons };
