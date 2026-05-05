const profilePanel = document.querySelector('.form-panel');
const buildsList = document.getElementById('my-builds-list');

const escapeHtml = (value = '') =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const renderEmptyState = (message) => {
    if (!buildsList) return;
    buildsList.innerHTML = `<p class="my-builds-placeholder">${escapeHtml(message)}</p>`;
};

const renderBuilds = (builds = []) => {
    if (!buildsList) return;

    if (!Array.isArray(builds) || builds.length === 0) {
        renderEmptyState('You have not created any builds yet.');
        return;
    }

    const cards = builds.map((build) => {
        const buildId = build?.id;
        const buildName = escapeHtml(build?.name || 'Untitled build');
        const gameName = escapeHtml(build?.game?.name || 'Unknown game');
        const description = escapeHtml(build?.description || 'No description available.');
        const visibility = build?.isPublic ? 'Public' : 'Private';

        return `
            <a href="/builds/${buildId}/edit" class="build-card-link">
                <article class="build-card">
                    <h3 class="build-card-title">${buildName}</h3>
                    <p class="build-card-meta">${gameName} · ${visibility}</p>
                    <p class="build-card-description">${description}</p>
                </article>
            </a>
        `;
    }).join('');

    buildsList.innerHTML = cards;
};

const loadMyBuilds = async () => {
    const username = profilePanel?.dataset?.username?.trim();

    if (!username) {
        renderEmptyState('Could not resolve your username to fetch builds.');
        return;
    }

    if (!window.api?.get) {
        renderEmptyState('API client unavailable.');
        return;
    }

    try {
        const response = await window.api.get(`/builds?creator=${encodeURIComponent(username)}&limit=20`);
        renderBuilds(response?.builds || []);
    } catch (error) {
        renderEmptyState(error?.message || 'Failed to load your builds.');
    }
};

loadMyBuilds();
