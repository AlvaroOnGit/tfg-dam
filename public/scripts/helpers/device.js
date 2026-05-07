export function deviceHandler() {
    let device = localStorage.getItem('device');

    if (!device) {
        device = crypto.randomUUID();
        localStorage.setItem('device', device);
    }

    return device;
}