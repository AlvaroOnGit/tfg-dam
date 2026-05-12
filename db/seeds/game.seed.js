/**
 * Contains a script to insert test assets for games into the database
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateGame } from '../../shared/validators/index.js';
import pool from '../connection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../../db/data/games.json');
const fileContent = await readFile(filePath, "utf8");
const json = JSON.parse(fileContent);

const validatedData = [];
const validationErrors = [];

for (const data of json){

    const { name } = data;

    const result = await validateGame(data);

    if (!result.success){
        validationErrors.push({ name, error: result.error});
    }
    else {
        validatedData.push(result.data);
    }
}

console.log(`${validatedData.length} assets validated, proceeding...\n`);

if (validationErrors.length > 0) {
    console.error(`${validationErrors.length} validation errors.`);
    validationErrors.forEach(e => console.error(`❌ ${e.name}\n${e.error}`));
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

let currenGame = "";

try {

    await client.query('BEGIN');

    for (const data of validatedData) {

        const game = data;
        currenGame = game;

        await client.query(`
        INSERT INTO games (name, slug, description, genres, cover_url, icon_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                game.name,
                game.slug,
                game.description,
                game.genres,
                game.coverUrl,
                game.iconUrl,
                game.isActive,
            ]
        )
        console.log(`✅ Game: ${game.name} inserted successfully.`);
    }

    await client.query('COMMIT');
    console.log(`✅ All games inserted successfully.`);

} catch (e) {
    await client.query('ROLLBACK');
    console.error(`❌ Error inserting game into the database, aborting.`);
    console.error(`Game: ${currenGame.name}\n${e}`);
    process.exit(1);

} finally {
    client.release();
}