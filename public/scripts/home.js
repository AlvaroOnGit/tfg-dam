import { getGames, getBuilds } from './api.js';

const pageAlert = document.getElementById('page-alert');

class GameHandler {
    static gameSection = document.querySelector('.section-games');
    static gameWrapper = this.gameSection.querySelector('.game-wrapper');
    static gameInput = this.gameSection.querySelector('.searchbar input');
    static cancelButton = this.gameSection.querySelector('.searchbar-cancel');
    static currentPage = 1;
    static searchTimeout = null;

    static async init() {
        this.gameInput.addEventListener('input', (e) => {
            this.cancelButton.classList.toggle('is-hidden', !e.target.value);
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.currentPage = 1;
                this.filterGames();
            }, 400);
        });

        this.cancelButton.addEventListener('click', () => {
            this.gameInput.value = '';
            this.cancelButton.classList.add('is-hidden');
            this.currentPage = 1;
            this.filterGames();
        });

        await this.filterGames();
    }
    static async filterGames() {
        const name = this.gameInput.value.trim();
        try {
            const data = await getGames({ page: this.currentPage, name });
            const games = Array.isArray(data.games) ? data.games : [];
            this.renderGames(games);
        } catch {
            showAlert('Could not load games. Check that the API is running.');
            this.gameWrapper.removeAttribute('aria-busy');
            this.gameWrapper.innerHTML = '<p style="color:var(--color-text-muted)">Games unavailable.</p>';
        }
    }
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
            createLink.className = 'button secondary';
            createLink.href = `/games/${encodeURIComponent(g.slug)}/builder`;
            createLink.textContent = 'Create build';

            actions.append(createLink);
            body.append(title, genres, actions);
            card.append(media, body);
            this.gameWrapper.appendChild(card);
        }
    }
}

class BuildHandler {
    static buildSection = document.querySelector('.section-builds');
    static buildWrapper = this.buildSection.querySelector('.build-wrapper');
    static buildInput = this.buildSection.querySelector('.searchbar input');
    static cancelButton = this.buildSection.querySelector('.searchbar-cancel');
    static currentPage = 1;
    static searchTimeout = null;

    static async init() {
        this.buildInput.addEventListener('input', (e) => {
            this.cancelButton.classList.toggle('is-hidden', !e.target.value);
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.currentPage = 1;
                this.filterBuilds();
            }, 400);
        });

        this.cancelButton.addEventListener('click', () => {
            this.buildInput.value = '';
            this.cancelButton.classList.add('is-hidden');
            this.currentPage = 1;
            this.filterBuilds();
        });

        await this.filterBuilds();
    }
    static async filterBuilds() {
        const name = this.buildInput.value.trim();
        try {
            const data = await getBuilds({ page: this.currentPage, name });
            const builds = Array.isArray(data.builds) ? data.builds : [];
            this.renderBuilds(builds);
        } catch {
            showAlert('Could not load builds. Check that the API is running.');
            this.buildWrapper.removeAttribute('aria-busy');
            this.buildWrapper.innerHTML = '<p style="color:var(--color-text-muted)">Builds unavailable.</p>';
        }
    }
    static renderBuilds(builds) {
        this.buildWrapper.innerHTML = '';
        this.buildWrapper.removeAttribute('aria-busy');

        if (!builds.length) {
            this.buildWrapper.innerHTML = '<p style="color:var(--color-text-muted)">No public builds to show yet.</p>';
            return;
        }

        for (const b of builds) {
            const id = b.id;
            const name = b.name;
            const game = b.game;
            const gameSlug = b.gameSlug;
            const tags = Array.isArray(b.tags) ? b.tags : [];
            const creator = b.creator;

            const card = document.createElement('a');
            card.className = 'build-card';
            card.href = `${gameSlug}/builds/${encodeURIComponent(id)}`;

            const media = document.createElement('div');
            media.className = 'build-card-media';

            const cover = document.createElement('img');
            cover.className = 'build-card-cover';
            cover.src = `media/games/${gameSlug}/graphics/${gameSlug}-build.webp`;
            cover.alt = `${game} Build Art`;

            //const icon = document.createElement('img');
            //icon.className = 'build-card-icon';
            //icon.src = `media/games/${gameSlug}/graphics/${gameSlug}-icon.webp`;
            //icon.alt = `${game} Icon`;
            //icon.title = `${game}`;

            const tagsEl = document.createElement('div');
            tagsEl.className = 'build-tags';
            for (const t of tags.slice(0, 4)) {
                const span = document.createElement('span');
                span.className = 'build-tag';
                span.textContent = String(t).toUpperCase();
                tagsEl.appendChild(span);
            }

            media.append(cover, tagsEl);

            const body = document.createElement('div');
            body.className = 'build-card-body';

            const title = document.createElement('h3');
            title.className = 'build-card-title';
            title.textContent = name;

            const meta = document.createElement('div');
            meta.className = 'build-card-meta';

            const gameEl = document.createElement('span');
            gameEl.className = 'build-card-game';
            gameEl.textContent = game;

            const creatorEl = document.createElement('span');
            creatorEl.className = 'build-card-creator';
            creatorEl.textContent = creator;

            meta.append(gameEl, creatorEl);
            body.append(title, meta);
            card.append(media, body);
            this.buildWrapper.appendChild(card);
        }
    }
}

function showAlert(message) {
    pageAlert.hidden = false;
    pageAlert.textContent = message;
}

function clearAlert() {
    pageAlert.hidden = true;
    pageAlert.textContent = '';
}

async function init() {
    clearAlert();

    await GameHandler.init();
    await BuildHandler.init();
}

init();