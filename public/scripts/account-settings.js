const form = document.getElementById('user-settings-form');
const message = document.getElementById('settings-message');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const saveButton = form?.querySelector('.btn-primary');
const avatarPlaceholder = document.querySelector('.avatar-placeholder');
const quickChangePasswordButton = document.getElementById('quick-change-password');
const logoutButton = document.getElementById('logout-button');

// Must match what's already in the inputs (SSR/EJS); otherwise every submit looks like
// username+email edits until GET /users/me finishes, blocking password-only saves.
const initialState = {
    username: (usernameInput?.value ?? '').trim(),
    email: (emailInput?.value ?? '').trim()
};
const LOGIN_ROUTE = '/auth';

const showMessage = (text, type = '') => {
    if (!message) return;
    message.textContent = text;
    message.classList.remove('success', 'error');
    if (type) {
        message.classList.add(type);
    }
};

const redirectToLogin = () => {
    window.location.replace(LOGIN_ROUTE);
};

const setAvatarInitial = (username) => {
    if (!avatarPlaceholder) return;
    const initial = (username || '').trim().charAt(0).toUpperCase() || 'A';
    avatarPlaceholder.textContent = initial;
};

const isAuthError = (response, errorText = '') => {
    if (response && (response.status === 401 || response.status === 403)) {
        return true;
    }

    const normalizedMessage = String(errorText).toLowerCase();
    return normalizedMessage.includes('access token not found')
        || normalizedMessage.includes('token')
        || normalizedMessage.includes('unauthorized')
        || normalizedMessage.includes('forbidden');
};

const loadProfile = async () => {
    try {
        // Si el objeto api no está disponible, salimos en silencio para evitar el error en el UI
        if (!window.api) return;

        const profile = await window.api.get('/users/me');
        usernameInput.value = profile.username || '';
        emailInput.value = profile.email || '';
        initialState.username = profile.username || '';
        initialState.email = profile.email || '';
        setAvatarInitial(initialState.username);
    } catch (error) {
        // Temporalmente desactivado para desarrollo
        // if (isAuthError({ status: error?.status }, error?.message)) {
        //     redirectToLogin();
        //     return;
        // }
        showMessage(error?.message || 'Network error while loading profile.', 'error');
    }
};

const patchEndpoint = async (url, payload, genericError) => {
    try {
        await window.api.patch(url, payload);
    } catch (error) {
        if (!error?.message) {
            const fallbackError = new Error(genericError);
            fallbackError.status = error?.status;
            throw fallbackError;
        }
        throw error;
    }
};

const handleSubmit = async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;

    const usernameChanged = username && username !== initialState.username;
    const emailChanged = email && email !== initialState.email;
    const wantsPasswordChange = Boolean(newPassword);
    const needsCurrentPassword = usernameChanged || emailChanged || wantsPasswordChange;

    if (!usernameChanged && !emailChanged && !wantsPasswordChange) {
        showMessage('No changes detected.');
        return;
    }

    if (needsCurrentPassword && !password) {
        showMessage('Current password is required to apply changes.', 'error');
        return;
    }

    const changeKinds = [usernameChanged, emailChanged, wantsPasswordChange].filter(Boolean).length;
    if (changeKinds > 1) {
        showMessage(
            'After each saved change the server closes your session. Please update only your username, or only your email, or only your password — one save at a time.',
            'error'
        );
        return;
    }

    saveButton.disabled = true;
    showMessage('Saving changes...');

    try {
        if (usernameChanged) {
            await patchEndpoint(
                '/users/me/username',
                { username, password },
                'Could not update username.'
            );
        } else if (emailChanged) {
            await patchEndpoint(
                '/users/me/email',
                { email, password },
                'Could not update email.'
            );
        } else if (wantsPasswordChange) {
            await patchEndpoint(
                '/users/me/password',
                { password, newPassword },
                'Could not update password.'
            );
        }

        showMessage(
            'Changes saved. Backend closed your session for security, please sign in again.',
            'success'
        );
        
        setTimeout(() => {
            redirectToLogin();
        }, 2000);
    } catch (error) {
        // Temporalmente desactivado para desarrollo
        // if (isAuthError({ status: error.status }, error.message)) {
        //     redirectToLogin();
        //     return;
        // }
        showMessage(error.message, 'error');
    } finally {
        saveButton.disabled = false;
    }
};

if (form) {
    form.addEventListener('submit', handleSubmit);
    loadProfile();
}

if (quickChangePasswordButton && newPasswordInput) {
    quickChangePasswordButton.addEventListener('click', () => {
        newPasswordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newPasswordInput.focus({ preventScroll: true });
    });
}

logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
        // Session cookies are httpOnly; server clears access_token + refresh_token on POST /api/auth/logout.
        if (window.api?.post) {
            await window.api.post('/auth/logout', {});
        }
    } catch (error) {
        console.warn('Logout request failed:', error.message);
    } finally {
        redirectToLogin();
    }
});
