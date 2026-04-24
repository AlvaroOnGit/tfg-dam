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
}