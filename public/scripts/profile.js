import { BuildHandler } from './helpers/builds.js';
import { updateUser, logout } from './api.js';
import { NotificationHandler } from './helpers/notification.js';

const editButton = document.getElementById('button-edit');
const logoutButton = document.getElementById('button-logout');
const notification = document.querySelector('.notification');

const notificationHandler = new NotificationHandler(notification);

if (logoutButton) {
    logoutButton.addEventListener('click', async e => {
        logoutButton.disabled = true;
        try {
            await logout();
            notificationHandler.displayNotification('success', 'Logout successful. Redirecting...' , 3000);

            setTimeout(() => {
                window.location.replace('/auth');
            }, 2000);

        } catch (e) {
            switch (e.status) {

            }
        } finally {
            logoutButton.disabled = false;
        }
    })
}

if (editButton) {
    editButton.addEventListener('click', () => {
        const isEditing = editButton.classList.toggle('active');
        editButton.title = isEditing ? 'Stop Editing' : 'Edit Profile';

        document.querySelectorAll('.username-wrapper > span, .email-wrapper > span')
            .forEach(el => el.classList.toggle('is-hidden', !isEditing));

        document.querySelectorAll('#edit-username, #edit-email')
            .forEach(el => el.classList.toggle('is-hidden', !isEditing));

        document.querySelector('.password-wrapper')
            .classList.toggle('is-hidden', !isEditing);

        editButton.querySelector('.material-symbols-outlined').textContent =
            isEditing ? 'close' : 'edit';
    });
}

class EditHandler {
    static editOverlay = document.querySelector('.edit-overlay');
    static submitFormButton = this.editOverlay.querySelector('.form-save')
    static formType = null;

    static editConfigs = {
        username: {
            title: 'Edit Username',
            fields: [
                { id: 'new-username', label: 'New Username', type: 'text', placeholder: 'username' },
                { id: 'current-password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ]
        },
        email: {
            title: 'Edit Email',
            fields: [
                { id: 'new-email', label: 'New Email', type: 'email', placeholder: 'new@email.com' },
                { id: 'current-password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ]
        },
        password: {
            title: 'Edit Password',
            fields: [
                { id: 'current-password', label: 'Current Password', type: 'password', placeholder: '••••••••' },
                { id: 'new-password', label: 'New Password', type: 'password', placeholder: '••••••••' },
                { id: 'confirm-password', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ]
        }
    };

    static openEditForm(type) {
        const cfg = this.editConfigs[type];
        this.formType = type;

        this.editOverlay.querySelector('.form-title').textContent = cfg.title;

        this.editOverlay.querySelector('.form-body').innerHTML = cfg.fields.map(f => `
        <div class="form-field ${f.type === 'password' ? 'password-wrapper' : ''}">
            <label for="${f.id}">${f.label}</label>
            <input id="${f.id}" name="${f.id}" type="${f.type}" placeholder="${f.placeholder}" autocomplete="off" required />
            ${f.type === 'password' ? `
                <button type="button" class="auth-password-toggle">
                    <span class="material-symbols-outlined" title="Show Password">visibility</span>
                </button>
            ` : ''}
        </div>
    `).join('');

        this.editOverlay.querySelectorAll('.auth-password-toggle').forEach(toggleBtn => {
            toggleBtn.addEventListener('click', () => {
                const input = toggleBtn.closest('.form-field').querySelector('input');
                const isHidden = input.type === 'password';
                input.type = isHidden ? 'text' : 'password';
                toggleBtn.querySelector('span').textContent = isHidden ? 'visibility_off' : 'visibility';
                toggleBtn.querySelector('span').title = isHidden ? 'Hide Password' : 'Show Password';
            });
        });

        this.editOverlay.classList.add('active');
        this.editOverlay.querySelector('.form-body input')?.focus();
    }
    static closeEditForm() {
        this.editOverlay.classList.remove('active');
        this.editOverlay.querySelector('.form-body').innerHTML = '';
    }
    static init() {
        this.editOverlay.querySelector('.form-close')
            .addEventListener('click', () => this.closeEditForm());

        this.editOverlay.addEventListener('click', (e) => {
            if (e.target === this.editOverlay) this.closeEditForm();
        });

        this.editOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeEditForm();
        });

        document.getElementById('edit-username')
            .addEventListener('click', () => this.openEditForm('username'));

        document.getElementById('edit-email')
            .addEventListener('click', () => this.openEditForm('email'));

        document.getElementById('edit-password')
            .addEventListener('click', () => this.openEditForm('password'));

        this.submitFormButton.addEventListener('click', () => this.submitForm());
    }
    static async submitForm() {

        this.submitFormButton.disabled = true;

        const inputs = this.editOverlay.querySelectorAll('.form-body input');
        const values = {};

        inputs.forEach(input => {
            values[input.name] = input.value;
        });

        let userData = {};

        switch (this.formType) {
            case 'username':
                userData = {
                    username: values['new-username'],
                    password: values['current-password']
                };
            break;

            case 'email':
                userData = {
                    email: values['new-email'],
                    password: values['current-password']
                };
            break;

            case 'password':
                if (values['new-password'] !== values['confirm-password']) {
                    notificationHandler.displayNotification('warning', `Passwords don't match`, 3000);
                    return;
                }

                userData = {
                    password: values['current-password'],
                    newPassword: values['new-password']
                };
            break;
        }

        try {
            const res = await updateUser(userData, this.formType);

            notificationHandler.displayNotification('success', res.message , 3000);

            setTimeout(() => {
                window.location.replace('/auth');
            }, 2000);

        } catch (e) {
            switch (e.status) {
                case 400: {
                    const errors = e.data?.errors;
                    if (errors) {
                        const firstError = Object.values(errors)[0][0];
                        notificationHandler.displayNotification('warning', firstError, 3000);
                    } else {
                        notificationHandler.displayNotification('warning', e.data.message, 3000);
                    }
                    break;
                }
                case 401: {
                    notificationHandler.displayNotification('warning', e.data.message, 3000);
                    break;
                }
                case 409: {
                    notificationHandler.displayNotification('warning', e.data.message, 3000);
                    break;
                }
                case 429: {
                    notificationHandler.displayNotification('warning', `Too many requests, try again later`, 3000);
                    break;
                }
                default: {
                    notificationHandler.displayNotification('error', `Server Error`, 3000);
                }
            }
        } finally {
            this.submitFormButton.disabled = false;
        }
    }
}

(async () => {
    const buildSection = document.querySelector('.section-builds');
    const userId = buildSection.dataset.userId;
    const buildHandler = new BuildHandler(buildSection, notificationHandler, { userId: userId });
    await buildHandler.init();
    if (editButton) {
        EditHandler.init();
    }
})();