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
        res.render('account-settings');
    }

}

