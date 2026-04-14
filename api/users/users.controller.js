export class UserController {

    constructor({ userService } = {}) {
        this.userService = userService;
    }

    #clearAuth = (res, message) => {
        res
            .status(200)
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .json({ message });
    }

    getMyProfile = async (req, res, next) => {
        try {
            const user = await this.userService.getMyProfile(req.user);
            res.status(200).json(user);
        } catch (e) {
            next(e);
        }
    }

    getPublicProfile = async (req, res, next) => {
        const { id } = req.params;
        try {
            const user = await this.userService.getProfileById(id);
            res.status(200).json(user);
        } catch (e) {
            next(e);
        }
    }

    updateEmail = async (req, res, next) => {
        const { email, password } = req.body;
        const { id } = req.user;
        try {
            await this.userService.updateEmail(id, password, email);
            this.#clearAuth(res, 'Email updated successfully.');
        } catch (e) {
            next(e);
        }
    }

    updatePassword = async (req, res, next) => {
        const { newPassword, password } = req.body;
        const { id } = req.user;
        try {
            await this.userService.updatePassword(id, password, newPassword);
            this.#clearAuth(res, 'Password updated successfully.');
        } catch (e) {
            next(e);
        }
    }

    updateUsername = async (req, res, next) => {
        const { username, password } = req.body;
        const { id } = req.user;
        try {
            await this.userService.updateUsername(id, password, username);
            this.#clearAuth(res, 'Username updated successfully.');
        } catch (e) {
            next(e);
        }
    }
}