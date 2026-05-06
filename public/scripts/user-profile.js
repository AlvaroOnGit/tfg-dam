/** Interactivity for the user profile page */
const profilePanel = document.querySelector('.form-panel');
const buildsList = document.getElementById('my-builds-list');
const profileUsername = document.getElementById('profile-username');
const profileAvatar = document.querySelector('.avatar-placeholder');
const editProfileBtn = document.getElementById('edit-profile-button');

// Detectamos el ID desde la URL si estamos en /users/:id
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const targetIdFromUrl = pathSegments[0] === 'users' ? pathSegments[1] : null;

// Si estamos visitando un perfil específico, ocultamos el botón de edición inmediatamente
if (targetIdFromUrl && editProfileBtn) {
    editProfileBtn.style.display = 'none';
}

let isMe = false;

const escapeHtml = (value = '') =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const renderEmptyState = (message) => {
    if (!buildsList) return;
    buildsList.innerHTML = `<div class="empty-state"><p class="my-builds-placeholder">${escapeHtml(message)}</p></div>`;
};

const renderBuilds = (builds = [], ownerName) => {
    if (!buildsList) return;

    if (!Array.isArray(builds) || builds.length === 0) {
        const message = isMe ? 'You have not created any builds yet.' : `${ownerName} has not created any builds yet.`;
        renderEmptyState(message);
        return;
    }

    const cards = builds.map((build) => {
        const buildId = build?.id;
        const buildName = escapeHtml(build?.name || 'Untitled build');
        const gameName = escapeHtml(build?.game?.name || 'Unknown game');
        const description = escapeHtml(build?.description || 'No description available.');
        const visibility = build?.isPublic ? 'Public' : 'Private';
        const buildUrl = isMe ? `/builds/${buildId}/edit` : `/builds/${buildId}`;

        return `
            <a href="${buildUrl}" class="build-card-link">
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

const loadProfileData = async () => {
    if (!window.api?.get) {
        renderEmptyState('API client unavailable.');
        return;
    }

    try {
        // 1. Identificamos quién es el usuario conectado
        const me = await window.api.get('/users/me').catch(() => null);
        
        // 2. Determinamos si estamos viendo nuestro propio perfil
        const normalizedMeId = me?.id?.toLowerCase();
        const normalizedTargetId = targetIdFromUrl?.toLowerCase();
        
        // Es "mi perfil" si no hay ID en la URL o si el ID coincide con el mío
        const isViewingSelf = !targetIdFromUrl || (normalizedMeId === normalizedTargetId);
        isMe = isViewingSelf;

        // Si es un perfil ajeno, limpiamos la UI para evitar ver datos del usuario logueado (SSR)
        if (!isMe && profileUsername) {
            profileUsername.textContent = 'Loading...';
            if (buildsList) buildsList.innerHTML = '';
        }
        
        const endpoint = isMe ? '/users/me' : `/users/${targetIdFromUrl}`;
        const userProfile = await window.api.get(endpoint);
        
        // 2. Actualizar UI del perfil
        if (profileUsername) profileUsername.textContent = userProfile.username;
        if (profileAvatar) {
            profileAvatar.textContent = (userProfile.username || 'A').charAt(0).toUpperCase();
        }
        
        // Ocultar botón de ajustes si no es mi perfil
        if (editProfileBtn) {
            editProfileBtn.style.display = isMe ? 'block' : 'none';
        }

        // 3. Cargar las builds del usuario
        const buildsResponse = await window.api.get(`/builds?creator=${encodeURIComponent(userProfile.username)}&limit=20`);
        renderBuilds(buildsResponse?.builds || [], userProfile.username);

    } catch (error) {
        renderEmptyState(error?.message || 'Failed to load profile.');
    }
};

loadProfileData();
