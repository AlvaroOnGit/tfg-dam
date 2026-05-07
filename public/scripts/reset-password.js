import { reset } from './api.js';
import { FormAlertHandler } from './helpers/alert.js'
import { deviceHandler } from "./helpers/device.js";

const formWrapper = document.querySelector('.auth-form-wrapper');

const passwordWrapper = formWrapper.querySelector('.auth-password-wrapper');

const passwordInput = passwordWrapper.querySelector('input');
const showPasswordButton = passwordWrapper.querySelector('.auth-password-toggle');
const submitButton = formWrapper.querySelector('.auth-submit');

const alertHandler = new FormAlertHandler(formWrapper);

showPasswordButton.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    showPasswordButton.querySelector('span').textContent = isHidden ? 'visibility_off' : 'visibility'
    showPasswordButton.querySelector('span').title = isHidden ? 'Hide Password' : 'Show Password'
})
formWrapper.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
        password: passwordInput.value,
        device: deviceHandler()
    }

    const token = window.location.pathname.replace('/auth/reset-password/', '');

    if (!token) {
        alertHandler.displayAlert('error', 'Invalid or missing token');
        return;
    }

    submitButton.disabled = true;

    try {
        const res = await reset(userData, token);

        alertHandler.displayAlert('success', `${res.message}. Redirecting...`);

        setTimeout(()=> {
            window.location.replace('/auth');
        }, 2000)

    } catch (e) {
        switch (e.status) {
            case 400: {
                alertHandler.displayAlert('warning', 'Invalid password.\n Password must have at least one uppercase letter, number and symbol');
                break;
            }
            case 401: {
                alertHandler.displayAlert('warning', 'Link expired, send another request to receive a new email');
                break;
            }
            case 409: {
                alertHandler.displayAlert('warning', 'New password cannot be the same as old password');
                break;
            }
            case 429: {
                alertHandler.displayAlert('warning', 'Too many requests, try again later');
                break;
            }
            default: alertHandler.displayAlert('error', 'Server error');
        }
    } finally {
        submitButton.disabled = false;
    }
})