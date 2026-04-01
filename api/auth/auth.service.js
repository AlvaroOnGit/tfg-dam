import argon2 from 'argon2';
import { TokenUtil } from '../../shared/utils/token.util.js'
import { validateUser } from '../../shared/validators/index.js';
import { AuthenticationError, DuplicateError, InternalError } from '../../shared/middlewares/error.middleware.js';

export class AuthService {

    constructor({ UserModel, TokenModel } = {}) {
        this.userModel = UserModel;
        this.tokenModel = TokenModel;
    }

    loginUser = async (email, password, device, userAgent) => {
        
        //Check if the user exists in the database
        let userCredentials;
        try {
            userCredentials = await this.userModel.findByEmail(email);
        } catch (e) {
            throw new InternalError('Failed to fetch user', e);
        }
        if (!userCredentials) {
            throw new AuthenticationError('Invalid credentials');
        }

        //Check the provided password against the hashed password in the database
        const validPassword = await argon2.verify(userCredentials.password, password);
        if (!validPassword) {
            throw new AuthenticationError('Invalid credentials');
        }

        //Mutate the userCredentials object with new properties
        Object.assign(userCredentials, { device: device, agent: userAgent });

        //Create an access token for the user containing relevant credentials
        const accessToken = TokenUtil.generateAccessToken(userCredentials)

        //Create a refresh token for the user containing its user id
        const refreshToken = TokenUtil.generateRefreshToken(userCredentials)

        //Construct a data object for the database
        const data = {
            user: userCredentials.id,
            token: refreshToken.token,
            device: device,
            agent: userAgent,
            expiration: refreshToken.expiration,
            revoked: null,
        }

        //Populate the token data in the database
        try {
            await this.tokenModel.saveRefreshToken(data);
        } catch (e) {
            throw new InternalError('Failed to save refresh token', e);
        }
        return { accessToken, refreshToken: refreshToken.token };
    }
    registerUser = async (username, email, password) => {

        //Check if the username or email already exists in the db
        let existingMail, existingUser;
        try {
            existingMail = await this.userModel.findByEmail(email);
            existingUser = await this.userModel.findByUsername(username);
        } catch (e) {
            throw new InternalError('Failed to check existing user', e)
        }
        if (existingMail) {
            throw new DuplicateError('Duplicate error', { email: 'Email already exists' });
        }
        if (existingUser) {
            throw new DuplicateError('Duplicate error', { username: 'Username already exists' });
        }

        //Construct a new user with a hashed password and additional db fields
        const user = {
            username: username,
            email: email,
            passwordHash: await argon2.hash(password),
            role: "user",
            roleLevel: "normal",
            avatar: null,
            state: "active",
            isVerified: false,
        }

        //Validate the user object we constructed is valid
        const validation = validateUser(user);
        if (!validation.success) {
            throw new InternalError('Error validating the user schema', validation.error.flatten().fieldErrors);
        }

        //Insert the user on the database
        try {
            return await this.userModel.createUser(user);
        } catch (e) {
            throw new InternalError('Failed to create user', e);
        }
    }
    logoutUser = async (id, token) => {
        // Query the database to revoke the refresh token for the user
        try {
            return await this.tokenModel.revokeRefreshToken(id, token);
        } catch (e) {
            throw new InternalError('Failed to revoke refresh token', e);
        }
    }
    refreshTokens = async (token) => {
        // Verify the refresh token and get the payload
        const payload = TokenUtil.verifyRefreshToken(token);

        // Query the database to know if the token is valid
        let validToken;
        try {
            validToken = await this.tokenModel.getRefreshToken(token);
        } catch (e) {
            throw new InternalError('Failed to validate refresh token', e);
        }
        if (!validToken) {
            throw new AuthenticationError('Refresh token revoked or expired');
        }

        //Get the users credentials from database
        let userCredentials;
        try {
            userCredentials = await this.userModel.findById(payload.id);
        } catch (e) {
            throw new InternalError('Failed to fetch user', e);
        }
        if (!userCredentials) {
            throw new AuthenticationError('Invalid credentials');
        }

        //Mutate the userCredentials object with new properties
        Object.assign(userCredentials, { device: payload.device, agent: payload.agent });

        // Generate new token pair for the user
        const accessToken = TokenUtil.generateAccessToken(userCredentials);
        const refreshToken = TokenUtil.generateRefreshToken(userCredentials);

        //Construct a data object for the database
        const data = {
            user: payload.id,
            token: refreshToken.token,
            device: payload.device,
            agent: payload.agent,
            expiration: refreshToken.expiration,
            revoked: null,
        }
        //Populate the token data in the database
        try {
            await this.tokenModel.saveRefreshToken(data);
        } catch (e) {
            throw new InternalError('Failed to save refresh token', e);
        }
        return { accessToken, refreshToken: refreshToken.token };
    }
}