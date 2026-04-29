/**
 * Controller responsible for rendering server-side views (EJS templates) in the application.
 *
 */

export class ViewController {

    index = (req, res) => {
        res.render('index');
    }
    auth = (req, res) => {
        if (req.user){
            return res.redirect('/');
        }
        res.render('auth');
    }
    gameBuilds = (req, res) => {
        const slug = req.params.slug;
        const user = req.user || null;
        res.render('games-builds', { gameSlug: slug, user });
    }
}