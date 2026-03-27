import { AuthenticationError, InternalError, NotFoundError } from '../../shared/middlewares/error.middleware.js';

export class UserService {
    constructor({ UserModel } = {}) {
        this.userModel = UserModel;
    }

    getMyProfile = async (requestUser) => {
        const userId = requestUser?.id;
        if (!userId) {
            throw new AuthenticationError('User not authorized');
        }

        try {
            const profile = await this.userModel.findPrivateProfileById(userId);
            if (!profile) {
                throw new AuthenticationError('User not authorized');
            }
            return profile;
        } catch (e) {
            if (e instanceof AuthenticationError) {
                throw e;
            }
            throw new InternalError('Failed to fetch user profile', e);
        }
    }

    getPublicProfileById = async (id) => {
        try {
            const profile = await this.userModel.findPublicProfileById(id);
            if (!profile) {
                throw new NotFoundError('User not found');
            }
            return profile;
        } catch (e) {
            if (e instanceof NotFoundError) {
                throw e;
            }
            throw new InternalError('Failed to fetch user profile', e);
        }
    }
}