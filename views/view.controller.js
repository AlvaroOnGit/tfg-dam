/**
 * Controller responsible for rendering server-side views (EJS templates) in the application.
 *
 */

export class ViewController {

    index = (req, res) => {
        res.render('index');
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

    auth = (req, res) => {
        if (req.user){
            return res.redirect('/');
        }
        res.render('auth');
    }

}
