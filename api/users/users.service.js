import {
    AuthenticationError,
    ConflictError,
    InternalError,
    NotFoundError
} from '../../shared/middlewares/error.middleware.js';
import argon2 from 'argon2';

export class UserService {
    constructor({ UserModel } = {}) {
        this.userModel = UserModel;
    }

    #fetchAndVerifyUser = async (id, password) => {
        let userCredentials;
        try {
            userCredentials = await this.userModel.findById(id);
        } catch (e) {
            throw new InternalError('Could not fetch user', e);
        }
        if (!userCredentials) {
            throw new NotFoundError('User not found');
        }

        const isCurrentPasswordValid = await argon2.verify(userCredentials.password, password);
        if (!isCurrentPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }

        return userCredentials;
    }

    getMyProfile = async (user) => {
        const { id } = user;

        let profile;
        try {
            profile = await this.userModel.findById(id);
        } catch (e) {
            throw new InternalError('Could not fetch user', e);
        }
        if (!profile) {
            throw new NotFoundError('User not found');
        }
        const { password, ...parsedProfile } = profile;
        return parsedProfile;
    }

    getProfileById = async (id) => {
        let profile;
        try {
            profile = await this.userModel.findById(id);
        } catch (e) {
            throw new InternalError('Could not fetch user', e);
        }
        if (!profile) {
            throw new NotFoundError('User not found');
        }
        const { password, role, roleLevel, isVerified, ...parsedProfile } = profile;
        return parsedProfile;
    }

    updateEmail = async (id, password, newEmail) => {
        const userCredentials = await this.#fetchAndVerifyUser(id, password);

        if (userCredentials.email === newEmail.toLowerCase()) {
            throw new ConflictError('Cannot use the same email');
        }

        try {
            return await this.userModel.updateUserEmail(id, newEmail);
        } catch (e) {
            if (e.code === '23505') { throw new ConflictError('Email already in use') }
            throw new InternalError('Could not update email', e);
        }
    }

    updatePassword = async (id, password, newPassword) => {
        const userCredentials = await this.#fetchAndVerifyUser(id, password);

        const isSamePassword = await argon2.verify(userCredentials.password, newPassword);
        if (isSamePassword) {
            throw new ConflictError('Cannot use the same password');
        }

        try {
            return await this.userModel.updateUserPassword(id, await argon2.hash(newPassword));
        } catch (e) {
            throw new InternalError('Could not update password', e);
        }
    }

    updateUsername = async (id, password, newUsername) => {
        const userCredentials = await this.#fetchAndVerifyUser(id, password);

        if (userCredentials.username === newUsername) {
            throw new ConflictError('Cannot use the same username');
        }

        try {
            return await this.userModel.updateUserName(id, newUsername);
        } catch (e) {
            if (e.code === '23505') { throw new ConflictError('Username already in use') }
            throw new InternalError('Could not update username', e);
        }
    }
}