/**
 * Contains a script to insert test assets for Tainted Grail into the database
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateAsset } from '../../validators/asset.validator.js';
import pool from '../connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const taintedGrailAssets = await readdir(path.join(__dirname, '../../db/data/games/tainted_grail'));

const validatedData = [];
const validationErrors = [];

for (const file of taintedGrailAssets) {

    const filePath = path.join(__dirname, '../../db/data/games/tainted_grail', file);
    const fileContent = await readFile(filePath, "utf8");
    const json = JSON.parse(fileContent);

    for (const data of json){

        const { name : assetName, type: assetType } = data;

        const result = await validateAsset(data);

        if (!result.success){
            validationErrors.push({name: assetName, type: assetType, error: result.error});
        }
        else {
            validatedData.push(result.data);
        }
    }
}

console.log(`${validatedData.length} assets validated, proceeding...\n`);

if (validationErrors.length > 0) {
    console.error(`${validationErrors.length} validation errors.`);
    validationErrors.forEach(e => console.error(`❌ ${e.name} - ${e.type}\n${e.error}`));
    process.exit(1);
}

const client = await pool.connect();

try {
    console.log(`Pinging database for connection...\n`);

    if (process.env.NODE_ENV === 'production') {
        client.release();
        console.error(`❌ Trying to connect to production database, aborting.\n`);
        process.exit(1);
    }
    await client.query('SELECT 1');
    console.log(`✅ Successfully connected to the database\n`);

} catch (e) {
    client.release();
    console.error(`❌ Could not connect to the database, aborting.\n${e}\n`);
    process.exit(1);
}

console.log(`Inserting ${validatedData.length} assets into the database...\n`);

let currentAsset = "";

try {

    await client.query('BEGIN');

    for (const data of validatedData) {

        const asset = data;
        currentAsset = asset;

        await client.query(`
            INSERT INTO game_assets (game_id, name, slug, type, category, description, short_description, icon_url, data, is_active)
            VALUES ((SELECT id FROM games WHERE slug = $1), $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                asset.gameSlug,
                asset.name,
                asset.slug,
                asset.type,
                asset.category,
                asset.description,
                asset.shortDescription,
                asset.iconUrl,
                asset.data,
                asset.isActive
            ]
        )
        console.log(`✅ Asset: ${asset.name} inserted successfully.`);
    }

    await client.query('COMMIT');
    console.log(`✅ All assets inserted successfully.`);

} catch (e) {
    await client.query('ROLLBACK');
    console.error(`❌ Error inserting asset into the database, aborting.`);
    console.error(`Asset: ${currentAsset.name}\n${e}`);
    process.exit(1);

} finally {
    client.release();
}