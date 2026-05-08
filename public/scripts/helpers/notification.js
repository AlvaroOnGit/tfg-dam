export class NotificationHandler {
    constructor(notification) {
        this.notification = notification;
        this.message = notification.querySelector('.notification-message');
    }

    displayNotification(type, message, duration) {
        this.notification.classList.remove('error', 'warning', 'success', 'is-hidden');
        this.notification.classList.add(type);
        this.message.textContent = message;

        if (duration) {
            setTimeout(() => {
                this.clearNotification();
            }, duration);
        }
    }

    clearNotification() {
        this.notification.classList.add('is-hidden');
    }
}