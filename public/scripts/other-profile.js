/** Frontend logic for viewing other users' public profiles */
const profileContainer = document.getElementById('other-profile-container');
const buildsList = document.getElementById('public-builds-list');
const profileUsername = document.getElementById('profile-username');
const profileAvatar = document.querySelector('.avatar-placeholder');

let targetId = profileContainer?.dataset?.targetId;

const escapeHtml = (value = '') =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const renderEmptyState = (message) => {
    if (!buildsList) return;
    buildsList.innerHTML = `<div class="empty-state"><p class="placeholder-text">${escapeHtml(message)}</p></div>`;
};

const renderBuilds = (builds = [], ownerName) => {
    if (!buildsList) return;

    if (!Array.isArray(builds) || builds.length === 0) {
        renderEmptyState(`${ownerName} has not published any builds yet.`);
        return;
    }

    const cards = builds.map((build) => {
        const buildId = build?.id;
        const buildName = escapeHtml(build?.name || 'Untitled build');
        const gameName = escapeHtml(build?.game?.name || 'Unknown game');
        const description = escapeHtml(build?.description || 'No description available.');

        return `
            <a href="/builds/${buildId}" class="build-card-link">
                <article class="build-card">
                    <h3 class="build-card-title">${buildName}</h3>
                    <p class="build-card-meta">${gameName}</p>
                    <p class="build-card-description">${description}</p>
                </article>
            </a>
        `;
    }).join('');

    buildsList.innerHTML = cards;
};

const loadPublicProfile = async () => {
    // Intento secundario de obtener el ID si el container falló inicialmente
    if (!targetId) {
        targetId = document.getElementById('other-profile-container')?.dataset?.targetId;
    }

    if (!window.api?.get || !targetId) {
        renderEmptyState('API client or Target ID unavailable.');
        return;
    }

    let userProfile;

    // 1. Intentar cargar el perfil del usuario
    try {
        userProfile = await window.api.get(`/users/${targetId}`);
        
        if (profileUsername) profileUsername.textContent = userProfile.username;
        if (profileAvatar) {
            profileAvatar.textContent = (userProfile.username || 'A').charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        const msg = error.status === 404 ? 'User not found.' : 'Failed to load profile data.';
        if (profileUsername) profileUsername.textContent = 'Error';
        renderEmptyState(msg);
        return; // Si no hay usuario, no intentamos cargar builds
    }

    // 2. Intentar cargar las builds (por separado para que un error aquí no rompa visualmente el perfil)
    try {
        const buildsResponse = await window.api.get(`/builds?creator=${encodeURIComponent(userProfile.username)}&limit=20`);
        renderBuilds(buildsResponse?.builds || [], userProfile.username);
    } catch (error) {
        console.error('Error loading builds:', error);
        renderEmptyState('Could not retrieve builds for this user at this time.');
    }
};

loadPublicProfile();