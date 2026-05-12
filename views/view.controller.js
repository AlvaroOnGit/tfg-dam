/**
 * Controller responsible for rendering server-side views (EJS templates) in the application.
 *
 */

const BASE_URL = process.env.BASE_URL;

export class ViewController {

    home = (req, res) => {
        const user = req.user;
        res.render('home', { user });
    }
    auth = (req, res) => {
        if (req.user){
            return res.redirect('/');
        }
        res.render('auth');
    }
    reset = (req, res) => {
        if (req.user){
            return res.redirect('/');
        }
        res.render('reset-password');
    }
    user = async (req, res) => {
        const targetId = req.params.id;

        if (req.user && req.user.id === targetId) {
            return res.redirect('/users/me');
        }

        try {
            const response = await fetch(`${BASE_URL}/api/users/${targetId}`, {
                headers: {
                    'Authorization': req.headers.authorization
                }
            });

            if (!response.ok) {
                return res.redirect('/');
            }

            const userData = await response.json();

            res.render('profile', { user: userData, isOwner: false });

        } catch (e) {
            res.redirect('/');
        }
    }
    userMe = (req, res) => {
        if (!req.user) {
            return res.redirect('/');
        }
        res.render('profile', { user: req.user, isOwner: true });
    }
    games = async (req, res) => {
        const targetGame = req.params.gameSlug;

        try {
            const response = await fetch(`${BASE_URL}/api/games/${targetGame}`);

            if (!response.ok) {
                return res.redirect('/');
            }

            const gameData = await response.json();


            res.render('games', { user: req.user || null, game: gameData });

        } catch (e) {
            res.redirect('/');
        }
    }

    builder = (req, res) => {
        if (!req.user) return res.redirect('/auth');

        const gameSlug = req.params.gameSlug;

        res.render('builder', { user: req.user, game: gameSlug, isOwner: true });
    };

    build = async (req, res) => {
        const gameSlug = req.params.gameSlug;
        const buildId = req.params.id;

        try {
            const buildResponse = await fetch(`${BASE_URL}/api/builds/${buildId}`);

            if (!buildResponse.ok) {
                return res.redirect('/');
            }

            const build = await buildResponse.json();

            const isOwner = req.user?.id === build.creatorId;

            if (!isOwner) {
                const creatorResponse = await fetch(`${BASE_URL}/api/users/${build.creatorId}`);

                const creator = await creatorResponse.json();

                return res.render('builder', {
                    user: req.user,
                    game: gameSlug,
                    build: build,
                    isOwner: isOwner,
                    creator: creator,
                });
            }

            res.render('builder', {
                user: req.user,
                game: gameSlug,
                build: build,
                isOwner: isOwner
            });

        } catch (e) {
            console.log(e)
            res.redirect('/');
        }
    }

    notFound = (req, res) => {
        res.render('not-found');
    }
}
