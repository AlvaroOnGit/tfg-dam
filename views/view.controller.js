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
        // Allow access via /games (no slug) or /games/:slug/builds or /games/:slug
        let slug = (req.params.slug || req.query.slug || 'elden-ring');
        slug = String(slug || '').toLowerCase();
        // Map simple slugs used in URLs to internal game slugs
        const slugMap = {
            'eldenring': 'elden-ring',
            'taintedgrail': 'tainted-grail',
            'elden-ring': 'elden-ring',
            'tainted-grail': 'tainted-grail'
        };
        const mapped = slugMap[slug] || slug;
        const user = req.user || null;
        res.render('games-builds', { gameSlug: mapped, user });
    }

    // createBuildPage removed: build creation handled by separate service/team.

    reset = (req, res) => {
        if (req.user){
            return res.redirect('/');
        }
        res.render('reset-password');
    }

    notFound = (req, res) => {
        res.render('not-found');
    }
}