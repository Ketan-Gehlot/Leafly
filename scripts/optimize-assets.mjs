import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function convertDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await convertDir(fullPath);
    } else if (file.endsWith('.png') && !file.includes('react.svg')) {
      const webpPath = fullPath.replace(/\.png$/, '.webp');
      console.log(`Converting ${file} -> .webp...`);
      await sharp(fullPath)
        .webp({ quality: 86, effort: 6 })
        .toFile(webpPath);
      const originalSize = (stat.size / 1024 / 1024).toFixed(2);
      const newSize = (fs.statSync(webpPath).size / 1024).toFixed(1);
      console.log(`✓ ${file}: ${originalSize}MB -> ${newSize}KB`);
    }
  }
}

async function run() {
  console.log('--- Optimizing src/assets ---');
  await convertDir(path.resolve('src/assets'));
  console.log('--- Optimizing public ---');
  await convertDir(path.resolve('public'));
  console.log('All image assets successfully optimized to WebP!');
}

run().catch(console.error);
