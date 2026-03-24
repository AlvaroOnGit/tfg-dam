export class UserController {
    constructor({ userService } = {}) {
        this.userService = userService;
    }

    getMyProfile = async (req, res, next) => {
        try {
            const requestUser = req.user ?? req.session?.user ?? { id: req.session?.userId };
            const profile = await this.userService.getMyProfile(requestUser);
            res.status(200).json(profile);
        } catch (e) {
            next(e);
        }
    }

    getPublicProfile = async (req, res, next) => {
        try {
            const { id } = req.params;
            const profile = await this.userService.getPublicProfileById(id);
            res.status(200).json(profile);
        } catch (e) {
            next(e);
        }
    }
}