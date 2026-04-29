/**
 * Home page: loads games and builds from the API (same-origin).
 */

const gameGrid = document.getElementById('game-grid');
const buildGrid = document.getElementById('build-grid');
const pageAlert = document.getElementById('page-alert');
const userSlot = document.getElementById('user-slot');
const buildsFilterLabel = document.getElementById('builds-filter-label');

/** @param {string} name */
function initialsFromName(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** @param {Record<string, unknown>} u */
function resolveAvatarSrc(u) {
    const raw = u.avatar ?? u.avatarUrl;
    if (raw == null || typeof raw !== 'string') return null;
    const t = raw.trim();
    if (!t) return null;
    if (t.startsWith('https://') || t.startsWith('http://') || t.startsWith('/')) return t;
    return null;
}

/** Silueta dorada centrada en el círculo (gradiente + hombros simétricos). */
const HEADER_AVATAR_SVG = `<svg class="header-avatar__svg" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="avatarSilGrad" x1="16" y1="3" x2="16" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f4e4b0"/><stop offset="42%" stop-color="#d8b968"/><stop offset="100%" stop-color="#8c6220"/></linearGradient></defs><g transform="translate(0 -2.65)"><circle cx="16" cy="10.75" r="5.05" fill="url(#avatarSilGrad)"/><path fill="url(#avatarSilGrad)" d="M8 30.35h16v-.28C24 24.9 20.55 20.75 16 20.75S8 24.9 8 30.07v.28z"/></g></svg>`;

function showAlert(message) {
    pageAlert.hidden = false;
    pageAlert.textContent = message;
}

function clearAlert() {
    pageAlert.hidden = true;
    pageAlert.textContent = '';
}

/**
 * @param {Array<{ id: string, slug: string, name: string, coverUrl?: string }>} games
 */
function renderGames(games) {
    gameGrid.innerHTML = '';
    gameGrid.removeAttribute('aria-busy');

    if (!games.length) {
        gameGrid.innerHTML = '<p class="muted">No games found.</p>';
        return;
    }

    for (const g of games) {
        const card = document.createElement('article');
        card.className = 'game-card';

        const media = document.createElement('div');
        media.className = 'game-card__media';
        if (g.coverUrl) {
            const img = document.createElement('img');
            img.className = 'game-card__cover';
            img.src = g.coverUrl;
            img.alt = '';
            img.loading = 'lazy';
            media.appendChild(img);
        } else {
            const ph = document.createElement('span');
            ph.className = 'game-card__media-placeholder';
            ph.textContent = '—';
            media.appendChild(ph);
        }

        const body = document.createElement('div');
        body.className = 'game-card__body';

        const title = document.createElement('h3');
        title.className = 'game-card__title';
        title.textContent = g.name;

        const actions = document.createElement('div');
        actions.className = 'game-card__actions';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn--primary';
        btn.textContent = 'View builds';
        btn.dataset.gameSlug = g.slug;
        actions.appendChild(btn);

        body.append(title, actions);
        card.append(media, body);
        gameGrid.appendChild(card);
    }
}

/**
 * @param {Array<Record<string, unknown>>} builds
 * @param {Map<string, { name: string, slug: string }>} gamesById
 */
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

/** @param {string|null} gameSlug */
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

async function loadUser() {
    userSlot.innerHTML = '';
    try {
        const res = await fetch('/api/users/me', { credentials: 'same-origin' });
        if (!res.ok) {
            const a = document.createElement('a');
            a.href = '/auth';
            a.className = 'header-avatar header-avatar--guest';
            a.setAttribute('aria-label', 'Account and sign-in');
            a.innerHTML = HEADER_AVATAR_SVG;
            userSlot.appendChild(a);
            return;
        }
        const u = await res.json();
        const chip = document.createElement('div');
        chip.className = 'user-chip';

        const av = document.createElement('a');
        av.href = '/user/settings';
        av.className = 'user-chip__avatar';
        av.setAttribute('aria-label', 'Account settings');
        const avatarSrc = resolveAvatarSrc(u);
        if (avatarSrc) {
            const img = document.createElement('img');
            img.src = avatarSrc;
            img.alt = '';
            av.appendChild(img);
        } else {
            av.textContent = initialsFromName(u.username || '?');
        }

        const name = document.createElement('span');
        name.className = 'user-chip__name';
        name.textContent = u.username || 'User';

        chip.append(av, name);
        userSlot.appendChild(chip);
    } catch {
        userSlot.innerHTML = '<span class="muted">Offline</span>';
    }
}

async function init() {
    clearAlert();

    const params = new URLSearchParams(window.location.search);
    const initialGameSlug = params.get('gameSlug');

    let games = [];
    const gamesById = new Map();

    try {
        const gamesRes = await fetch('/api/games?limit=20&page=1', { credentials: 'same-origin' });
        if (!gamesRes.ok) throw new Error('games');
        const gamesData = await gamesRes.json();
        games = Array.isArray(gamesData.games) ? gamesData.games : [];
        for (const g of games) gamesById.set(g.id, { name: g.name, slug: g.slug });
        renderGames(games);
    } catch {
        showAlert('Could not load games. Check that the API is running.');
        gameGrid.removeAttribute('aria-busy');
        gameGrid.innerHTML = '<p class="muted">Games unavailable.</p>';
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

    gameGrid.addEventListener('click', (e) => {
        const t = /** @type {HTMLElement} */ (e.target);
        const btn = t.closest('button[data-game-slug]');
        if (!btn || !(btn instanceof HTMLButtonElement)) return;
        const slug = btn.dataset.gameSlug;
        if (!slug) return;
        loadBuilds(slug, gamesById).catch(() => showAlert('Could not load builds for that game.'));
        document.getElementById('popular-builds')?.scrollIntoView({ behavior: 'smooth' });
    });

    loadUser();
}

init();
