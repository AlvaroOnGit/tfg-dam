/**
 * Controller responsible for rendering server-side views (EJS templates) in the application.
 *
 */

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
    notFound = (req, res) => {
        res.render('not-found');
    }

    userAccount = (req, res) => {
        if (req.user == null) {
            return res.redirect('/');
        }
        res.render('account-settings', { user: req.user });
    }

    userProfile = (req, res) => {
        if (req.user == null) {
            return res.redirect('/');
        }
        res.render('user-profile', { user: req.user });
    }

    otherProfile = (req, res) => {
        const targetId = req.params.id;

        // Si el ID es el del propio usuario logueado, redirigir a su perfil privado
        if (req.user && req.user.id === targetId) {
            return res.redirect('/user/me');
        }

        res.render('other-profile', { user: req.user, targetId });
    }

}
