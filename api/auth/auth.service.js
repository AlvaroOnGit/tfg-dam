import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { validateUser } from '../../shared/validators/index.js';
import { AuthenticationError, DuplicateError, InternalError } from '../../shared/middlewares/error.middleware.js';

export class AuthService {

    constructor({ UserModel, TokenModel } = {}) {
        this.userModel = UserModel;
        this.TokenModel = TokenModel;
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

        console.log(userCredentials)

        const accessToken = jwt.sign(
            {
                id: userCredentials.id,
                email: userCredentials.email,
                username: userCredentials.username,
                role: userCredentials.role,
                roleLevel: userCredentials.roleLevel,
                isVerified: userCredentials.isVerified
            }
        )


        const data = {
            user: userCredentials.id,
            token: '',
            device: device,
            agent: userAgent,
            expiration: '',
            revoked: null,
        }


        //return userCredentials;
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
}