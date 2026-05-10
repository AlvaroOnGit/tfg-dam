/**
 * One-shot: builds game cover + icon webp under public/media from source PNGs.
 * Run: node scripts/build-game-graphics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const jobs = [
    {
        slug: 'elden-ring',
        input: path.join(
            'C:',
            'Users',
            'User',
            '.cursor',
            'projects',
            'c-Users-User-WebstormProjects',
            'assets',
            'c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_73756cfbec9bdb53897b5ccb967b3868_images_Captura_de_pantalla_2026-04-22_140152-9aa15247-161a-4e66-9ffe-7bcc7de7d7dd.png'
        ),
    },
    {
        slug: 'tainted-grail',
        input: path.join(
            'C:',
            'Users',
            'User',
            '.cursor',
            'projects',
            'c-Users-User-WebstormProjects',
            'assets',
            'c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_73756cfbec9bdb53897b5ccb967b3868_images_Captura_de_pantalla_2026-04-22_140203-b83ecd29-eff5-4151-80e5-050b9c425496.png'
        ),
    },
];

for (const { slug, input } of jobs) {
    if (!fs.existsSync(input)) {
        console.error(`Missing source: ${input}`);
        process.exit(1);
    }
    const outDir = path.join(root, 'public', 'media', 'games', slug, 'graphics');
    fs.mkdirSync(outDir, { recursive: true });
    const coverOut = path.join(outDir, `${slug}-cover.webp`);
    const iconOut = path.join(outDir, `${slug}-icon.webp`);

    await sharp(input)
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 88, effort: 4 })
        .toFile(coverOut);

    await sharp(input)
        .resize(144, 144, { fit: 'cover', position: 'attention' })
        .webp({ quality: 85, effort: 4 })
        .toFile(iconOut);

    console.log(`Wrote ${coverOut}`);
    console.log(`Wrote ${iconOut}`);
}
