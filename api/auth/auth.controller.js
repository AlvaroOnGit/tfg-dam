
export class AuthController {

    constructor({ authService } = {}) {
        this.authService = authService;
    }

    login = async (req, res, next) => {
        try {
            const { email, password, device } = req.body;
            const userAgent = req.headers['user-agent'];
            const credentials = await this.authService.loginUser(email, password, device, userAgent);
            res.status(200).json({message: 'Authentication successful'});
        } catch (e) {
            next(e)
        }
    }
    register = async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            await this.authService.registerUser(username, email, password);
            res.status(201).json({message: 'User registered successfully'});
        } catch (e) {
            next(e);
        }
    }
}