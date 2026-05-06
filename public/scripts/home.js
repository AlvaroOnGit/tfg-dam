import { getGames } from './api.js';

const gameWrapper = document.querySelector('.game-wrapper');
const buildGrid = document.getElementById('build-grid');
const pageAlert = document.getElementById('page-alert');
const userSlot = document.getElementById('user-slot');
const buildsFilterLabel = document.getElementById('builds-filter-label');
const myBuildsLink = document.getElementById('my-builds-link');

class GameHandler {
    static gameWrapper = document.querySelector('.game-wrapper');

    static renderGames(games) {
        this.gameWrapper.innerHTML = '';
        this.gameWrapper.removeAttribute('aria-busy');

        if (!games.length) {
            this.gameWrapper.innerHTML = '<p style="color:var(--color-text-muted)">No games found.</p>';
            return;
        }

        for (const g of games) {
            const card = document.createElement('a');
            card.className = 'game-card';
            card.href = `/games/${encodeURIComponent(g.slug)}`;

            const media = document.createElement('div');
            media.className = 'game-card-media';
            if (g.coverUrl) {
                const img = document.createElement('img');
                img.className = 'game-card-cover';
                img.src = g.coverUrl;
                img.alt = `${g.name} Cover Art`;
                img.loading = 'lazy';
                media.appendChild(img);
            } else {
                const ph = document.createElement('span');
                ph.className = 'game-card-media-placeholder';
                ph.textContent = '—';
                media.appendChild(ph);
            }

            const body = document.createElement('div');
            body.className = 'game-card-body';

            const title = document.createElement('h3');
            title.className = 'game-card-title';
            title.textContent = g.name;

            const genres = document.createElement('p');
            genres.className = 'game-card-genres';
            genres.textContent = g.genres.join(', ');


            const actions = document.createElement('div');
            actions.className = 'game-card-actions';

            const createLink = document.createElement('a');
            createLink.className = 'button primary';
            createLink.href = `/games/${encodeURIComponent(g.slug)}/builder`;
            createLink.textContent = 'Create build';

            actions.append(createLink);

            body.append(title, genres, actions);
            card.append(media, body);
            this.gameWrapper.appendChild(card);
        }
    }
}


function initialsFromName(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function showAlert(message) {
    pageAlert.hidden = false;
    pageAlert.textContent = message;
}

function clearAlert() {
    pageAlert.hidden = true;
    pageAlert.textContent = '';
}

function renderBuilds(builds, gamesById) {
    buildGrid.innerHTML = '';
    buildGrid.removeAttribute('aria-busy');

    if (!builds.length) {
        buildGrid.innerHTML = '<p class="muted">No public builds to show yet.</p>';
        return;
    }

    for (const b of builds) {
        const id = /** @type {string} */ (b.id);
        const name = /** @type {string} */ (b.name);
        const gameId = /** @type {string|undefined} */ (b.gameId);
        const tags = Array.isArray(b.tags) ? b.tags : [];

        const game = gameId ? gamesById.get(gameId) : undefined;
        const gameLabel = game ? game.name : 'Unknown game';

        const card = document.createElement('a');
        card.className = 'build-card';
        card.href = `/builds/${encodeURIComponent(id)}`;

        const top = document.createElement('div');
        top.className = 'build-card__top';

        const thumb = document.createElement('div');
        thumb.className = 'build-card__thumb';
        thumb.textContent = initialsFromName(name);
        thumb.setAttribute('aria-hidden', 'true');

        const textWrap = document.createElement('div');
        const h = document.createElement('h3');
        h.className = 'build-card__name';
        h.textContent = name;

        const meta = document.createElement('p');
        meta.className = 'build-card__meta';
        meta.textContent = gameLabel;

        textWrap.append(h, meta);
        top.append(thumb, textWrap);

        const tagsEl = document.createElement('div');
        tagsEl.className = 'build-card__tags';
        for (const t of tags.slice(0, 8)) {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = String(t).replace(/-/g, ' ');
            tagsEl.appendChild(span);
        }

        card.append(top, tagsEl);
        buildGrid.appendChild(card);
    }
}


async function loadBuilds(gameSlug, gamesById) {
    buildGrid.setAttribute('aria-busy', 'true');
    buildGrid.innerHTML = '<p class="muted">Loading builds…</p>';

    const params = new URLSearchParams({ limit: '12', page: '1' });
    if (gameSlug) params.set('gameSlug', gameSlug);

    const res = await fetch(`/api/builds?${params}`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Could not load builds');

    const data = await res.json();
    const raw = Array.isArray(data.builds) ? data.builds : [];

    const filtered = raw.filter(
        (b) => b.isPublic === true && b.isPublished === true
    );

    if (buildsFilterLabel) {
        if (gameSlug) {
            buildsFilterLabel.hidden = false;
            buildsFilterLabel.textContent = `Filtered by game: ${gameSlug.replace(/-/g, ' ')}`;
        } else {
            buildsFilterLabel.hidden = true;
            buildsFilterLabel.textContent = '';
        }
    }

    renderBuilds(filtered.length ? filtered : raw, gamesById);
}

async function init() {
    clearAlert();

    const params = new URLSearchParams(window.location.search);
    const initialGameSlug = params.get('gameSlug');

    let games = [];
    const gamesById = new Map();

    try {
        const gamesData = await getGames({ page: 1 });
        games = Array.isArray(gamesData.games) ? gamesData.games : [];
        for (const g of games) gamesById.set(g.id, { name: g.name, slug: g.slug });
        GameHandler.renderGames(games);
    } catch {
        showAlert('Could not load games. Check that the API is running.');
        gameWrapper.removeAttribute('aria-busy');
        gameWrapper.innerHTML = '<p class="muted">Games unavailable.</p>';
    }

    try {
        const q = new URLSearchParams({ limit: '24', page: '1' });
        if (initialGameSlug) q.set('gameSlug', initialGameSlug);
        const buildsRes = await fetch(`/api/builds?${q}`, { credentials: 'same-origin' });
        if (!buildsRes.ok) throw new Error('builds');
        const buildsData = await buildsRes.json();
        const rawBuilds = Array.isArray(buildsData.builds) ? buildsData.builds : [];
        const filtered = rawBuilds.filter((b) => b.isPublic === true && b.isPublished === true);
        renderBuilds(filtered.length ? filtered : rawBuilds, gamesById);

        if (buildsFilterLabel && initialGameSlug) {
            buildsFilterLabel.hidden = false;
            buildsFilterLabel.textContent = `Filtered by game: ${initialGameSlug.replace(/-/g, ' ')}`;
        }
    } catch {
        showAlert(
            pageAlert.textContent
                ? 'Could not load games or builds. Check that the API is running.'
                : 'Could not load builds. Check that the API is running.'
        );
        buildGrid.removeAttribute('aria-busy');
        buildGrid.innerHTML = '<p class="muted">Builds unavailable.</p>';
    }

    gameWrapper.addEventListener('click', (e) => {
        const t = /** @type {HTMLElement} */ (e.target);
        const btn = t.closest('button[data-game-slug]');
        if (!btn || !(btn instanceof HTMLButtonElement)) return;
        const slug = btn.dataset.gameSlug;
        if (!slug) return;
        window.location.href = `/games/${encodeURIComponent(slug)}/builds`;
    });
}

init();