import { register, login, forgot } from './api.js';
import { deviceHandler } from "./helpers/device.js";
import { NotificationHandler } from './helpers/notification.js';

const formWrapper = document.querySelector('.auth-form-wrapper');

const usernameWrapper = formWrapper.querySelector('.auth-username-wrapper');
const emailWrapper = formWrapper.querySelector('.auth-email-wrapper');
const passwordWrapper = formWrapper.querySelector('.auth-password-wrapper');
const toggleWrapper = formWrapper.querySelector('.auth-toggle-wrapper');

const usernameInput = usernameWrapper.querySelector('input');
const emailInput = emailWrapper.querySelector('input');
const passwordInput = passwordWrapper.querySelector('input');

const toggleButton = toggleWrapper.querySelector('a');
const submitButton = formWrapper.querySelector('.auth-submit');
const forgotButton = formWrapper.querySelector('.auth-forgot');
const showPasswordButton = passwordWrapper.querySelector('.auth-password-toggle');

const notification = document.querySelector('.notification');
const notificationHandler = new NotificationHandler(notification);

let formType = 'login';

toggleButton.addEventListener('click', event => {
    event.preventDefault();

    if (formType === 'login') {
        formType = 'register';
    } else if (formType === 'register') {
        formType = 'login';
    } else if (formType === 'forgot') {
        formType = 'login';
    }

    updateForm();
})
forgotButton.addEventListener('click', event => {
    event.preventDefault();

    formType = 'forgot';

    updateForm();
})
formWrapper.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
        username: usernameInput.value || null,
        email: emailInput.value,
        password: passwordInput.value || null,
        device: deviceHandler()
    }

    submitButton.disabled = true;

    try {
        const res = await submitForm(userData);

        notificationHandler.displayNotification('success', res.message);

        switch (formType) {
            case 'login': {
                window.location.replace('/');
                break;
            }
            case 'register': {
                formType = 'login';
                updateForm();
                break;
            }
            case 'forgot': {
                formType = 'login';
                updateForm();
            }
        }

    } catch (e) {
        switch (e.status) {
            case 400: {
                notificationHandler.displayNotification('warning', 'Invalid email or password.\n Password must have at least one uppercase letter, number and symbol');
                break;
            }
            case 401: {
                notificationHandler.displayNotification('warning', 'Wrong email or password');
                break;
            }
            case 409: {
                notificationHandler.displayNotification('warning', e.data.message);
                break;
            }
            case 429: {
                notificationHandler.displayNotification('warning', 'Too many requests, try again later');
                break;
            }
            default: notificationHandler.displayNotification('error', 'Server error');
        }
    } finally {
        submitButton.disabled = false;
    }
})

showPasswordButton.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    showPasswordButton.querySelector('span').textContent = isHidden ? 'visibility_off' : 'visibility'
    showPasswordButton.querySelector('span').title = isHidden ? 'Hide Password' : 'Show Password'
})

function updateForm(){

    const toggleText = toggleWrapper.querySelector('p');
    const formTitle = formWrapper.querySelector('h2');

    switch(formType){
        case 'register': {
            usernameWrapper.classList.remove('is-hidden');
            usernameInput.required = true;
            emailWrapper.classList.remove('is-hidden');
            emailInput.required = true;
            passwordWrapper.classList.remove('is-hidden');
            passwordInput.required = true;
            forgotButton.classList.remove('is-hidden');

            formTitle.textContent = 'Register';
            submitButton.textContent = "SIGN UP";
            toggleText.textContent = "Have an account?";
            toggleButton.textContent = "Sign In";
            break;
        }

        case 'login': {
            usernameWrapper.classList.add('is-hidden');
            usernameInput.required = false;
            emailWrapper.classList.remove('is-hidden');
            emailInput.required = true;
            passwordWrapper.classList.remove('is-hidden');
            passwordInput.required = true;
            forgotButton.classList.remove('is-hidden');

            formTitle.textContent = 'Login';
            submitButton.textContent = "SIGN IN";
            toggleText.textContent = "Don't have an account?";
            toggleButton.textContent = "Sign Up";
            break;
        }

        case 'forgot': {
            usernameWrapper.classList.add('is-hidden');
            usernameInput.required = false;
            emailWrapper.classList.remove('is-hidden');
            emailInput.required = true;
            passwordWrapper.classList.add('is-hidden');
            passwordInput.required = false;
            forgotButton.classList.add('is-hidden');

            formTitle.textContent = 'Reset Password';
            submitButton.textContent = "RESET PASSWORD";
            toggleText.textContent = "Remember your password?";
            toggleButton.textContent = "Sign In";
            break;
        }
    }
}

async function submitForm(userData) {

    switch(formType){
        case 'login': {
            const {username, ...data} = userData;
            return await login(data);
        }
        case 'register': {
            return await register(userData);
        }
        case 'forgot': {
            const { username, password, ...data } = userData;
            return await forgot(data);
        }
    }
}