import fs from 'fs/promises';
import path from 'path';
import { validateAsset } from '../validators/asset.validator.js';

async function run(filePath) {
  try {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const raw = await fs.readFile(absPath, 'utf8');
    const data = JSON.parse(raw);
    const result = await validateAsset(data);
    if (result.success) {
      console.log(`OK: ${filePath} - válido`);
    } else {
      console.error(`INVALID: ${filePath}`);
      if (result.error && typeof result.error.format === 'function') {
        console.error(JSON.stringify(result.error.format(), null, 2));
      } else {
        console.error(JSON.stringify(result.error || result, null, 2));
      }
      process.exitCode = 2;
    }
  } catch (err) {
    console.error('Error ejecutando validador:', err.message);
    process.exitCode = 1;
  }
}

if (process.argv.length < 3) {
  console.error('Uso: node scripts/run-validator.mjs <ruta-al-json>');
  process.exit(1);
}

run(process.argv[2]);