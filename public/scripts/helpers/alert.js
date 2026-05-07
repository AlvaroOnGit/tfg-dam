export class FormAlertHandler {
    constructor(formWrapper) {
        this.alertWrapper = formWrapper.querySelector('.auth-form-alert');
        this.alertText = this.alertWrapper.querySelector('.alert-message');
    }

    displayAlert(type, message) {
        this.alertWrapper.classList.remove('error', 'warning', 'success', 'is-hidden');
        this.alertWrapper.classList.add(type);
        this.alertText.textContent = message;
    }

    clearAlert() {
        this.alertWrapper.classList.add('is-hidden');
    }
}