import { BuildHandler } from './helpers/builds.js';
import { NotificationHandler } from './helpers/notification.js';

(async () => {
    const notification = document.querySelector('.notification');
    const myBuildsSection = document.querySelector('.section-my-builds');
    const buildsSection = document.querySelector('.section-builds');
    const gameSlug = buildsSection.dataset.gameSlug;

    const notificationHandler = new NotificationHandler(notification);

    if (myBuildsSection) {
        const userId = myBuildsSection.dataset.userId;
        const personalBuildHandler = new BuildHandler(myBuildsSection, notificationHandler, { gameSlug, userId });
        await personalBuildHandler.init();
    }

    const buildHandler = new BuildHandler(buildsSection, notificationHandler, { gameSlug });
    await buildHandler.init();
})();