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
}