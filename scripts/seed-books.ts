import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const booksDir = path.resolve(process.cwd(), 'public/books');
const outputDir = path.resolve(process.cwd(), 'public');
const seedFilePath = path.join(outputDir, 'seed.json');

/**
 * Generates a clean title from a filename.
 * Example: "The-social-contract-and-discourses.epub" -> "The Social Contract and Discourses"
 */
function createTitleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.epub$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Calculates the SHA-256 hash of a file.
 */
async function getFileHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Main function to generate the book seed manifest.
 */
async function generateBookSeed() {
  console.log('Starting book seed generation...');

  try {
    const files = await fs.readdir(booksDir);
    const epubFiles = files.filter((file) => file.toLowerCase().endsWith('.epub'));

    if (epubFiles.length === 0) {
      console.warn('No .epub files found in public/books. Seed file will be empty.');
      await fs.writeFile(seedFilePath, JSON.stringify({}, null, 2));
      return;
    }

    const seedData = {};

    await Promise.all(
      epubFiles.map(async (fileName) => {
        const filePath = path.join(booksDir, fileName);
        const hash = await getFileHash(filePath);
        const title = createTitleFromFileName(fileName);
        const url = `/books/${fileName}`;

        console.log(`Processing: ${fileName} (Hash: ${hash.substring(0, 12)}...)`);

        seedData[hash] = {
          fileName,
          title,
          url,
        };
      })
    );

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(seedFilePath, JSON.stringify(seedData, null, 2));

    console.log(`✅ Successfully generated seed file at: ${seedFilePath}`);
    console.log(`Found and processed ${epubFiles.length} books.`);

  } catch (error) {
    console.error('❌ Error generating book seed file:', error);
    process.exit(1);
  }
}

generateBookSeed();
