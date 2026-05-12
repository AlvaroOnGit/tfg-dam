import { getGames } from './api.js';
import { BuildHandler } from './helpers/builds.js';
import { NotificationHandler } from './helpers/notification.js';

const buildSection = document.querySelector('.section-builds')
const notification = document.querySelector('.notification');
const notificationHandler = new NotificationHandler(notification);

const buildHandler = new BuildHandler(buildSection, notificationHandler);

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
            notificationHandler.displayNotification('error','Could not load games. Check that the API is running.');
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

async function init() {

    await GameHandler.init();
    await buildHandler.init();
}

init();