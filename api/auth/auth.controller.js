import { AuthenticationError } from "../../shared/middlewares/error.middleware.js";

// noinspection JSUnresolvedReference
export class AuthController {

    constructor({ authService } = {}) {
        this.authService = authService;
    }

    login = async (req, res, next) => {
        try {
            const { email, password, device } = req.body;
            const userAgent = req.headers['user-agent'];
            const { accessToken, refreshToken } = await this.authService.loginUser(email, password, device, userAgent);
            res
                .status(200)
                .cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000
                })
                .cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: Number(process.env.JWT_REFRESH_TOKEN_LIFETIME) * 24 * 60 * 60 * 1000
                })
                .json({message: 'Authentication successful'});
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
    logout = async (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationError('Access token not found'));
        }

        const { id } = req.user
        const token = req.cookies.refresh_token;

        if (!token) {
            return next(new AuthenticationError('Refresh token not found'));
        }

        try {
            await this.authService.logoutUser(id, token);
            res
                .status(200)
                .clearCookie('access_token')
                .clearCookie('refresh_token')
                .json({message: 'User logged out'});
        } catch (e) {
            next(e)
        }
    }
    refresh = async (req, res, next) => {
        const token = req.cookies.refresh_token;
        if (!token) {
            return next(new AuthenticationError('Refresh token not found'));
        }

        try {
            const { accessToken, refreshToken } = await this.authService.refreshTokens(token);
            res
                .status(200)
                .cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000
                })
                .cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: Number(process.env.JWT_REFRESH_TOKEN_LIFETIME) * 24 * 60 * 60 * 1000
                })
                .json({message: 'Tokens refreshed successfully'});
        }
        catch (e) {
            next(e)
        }
    }
    forgot = async (req, res, next) => {
        const { email, device } = req.body;
        const userAgent = req.headers['user-agent'];
        try {
            await this.authService.forgotPassword(email, device, userAgent);
            res.status(200).json({message: 'If the address exists, an email with instructions has been sent'});
        }
        catch (e) {
            next(e)
        }
    }
    reset = async (req, res, next) => {
        const token = req.params.token;
        const { password } = req.body;
        try {
            await this.authService.resetPassword(token, password);
            res.status(200).json({ message: 'Password updated successfully' });
        } catch (e) {
            next(e);
        }
    }
}