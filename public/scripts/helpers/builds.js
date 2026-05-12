import { getBuilds } from "../api.js";

export class BuildHandler {
    constructor(buildSection, notificationHandler, options = {}) {
        this.notificationHandler = notificationHandler;
        this.buildWrapper = buildSection.querySelector('.build-wrapper');
        this.buildInput = buildSection.querySelector('.searchbar input');
        this.cancelButton = buildSection.querySelector('.searchbar-cancel');
        this.currentPage = 1;
        this.searchTimeout = null;
        this.userId = options.userId || null;
        this.gameSlug = options.gameSlug || null;
    }

    async init() {
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
    async filterBuilds() {
        const name = this.buildInput.value.trim();
        try {
            const params = { page: this.currentPage, name };
            if (this.userId) params.creator = this.userId;
            if (this.gameSlug) params.gameSlug = this.gameSlug;

            const data = await getBuilds(params);
            const builds = Array.isArray(data.builds) ? data.builds : [];
            this.renderBuilds(builds);
        } catch {
            this.notificationHandler.displayNotification('error', 'Could not load builds. Check that the API is running.');
            this.buildWrapper.removeAttribute('aria-busy');
            this.buildWrapper.innerHTML = '<p style="color:var(--color-text-muted)">Builds unavailable.</p>';
        }
    }
    renderBuilds(builds) {
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
            const creatorId = b.creatorId;

            const card = document.createElement('a');
            card.className = 'build-card';
            card.href = `/games/${gameSlug}/builds/${encodeURIComponent(id)}`;

            const media = document.createElement('div');
            media.className = 'build-card-media';

            const cover = document.createElement('img');
            cover.className = 'build-card-cover';
            cover.src = `/media/games/${gameSlug}/graphics/${gameSlug}-build.webp`;
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
            creatorEl.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/users/${creatorId}`;
            }

            meta.append(gameEl, creatorEl);
            body.append(title, meta);
            card.append(media, body);
            this.buildWrapper.appendChild(card);
        }
    }
}