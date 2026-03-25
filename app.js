import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { UserModel } from './shared/models/user.model.js';
import { TokenModel } from './shared/models/token.model.js';
import { createViewRouter } from './views/view.routes.js';
import { createAuthRouter } from './api/auth/auth.routes.js';
import { createUserRouter } from './api/users/users.routes.js';
import { createBuildRouter } from './api/builds/builds.routes.js';
import { createAssetRouter } from './api/assets/assets.routes.js';
import { createGameRouter } from './api/games/games.routes.js';
import { errorHandler } from './shared/middlewares/error.middleware.js';

export const createApp = () => {

    const app = express();

    //Deactivate express native header
    app.disable('x-powered-by');
    //Set ejs as the view engine for express
    app.set('view engine', 'ejs');
    //Express middleware to parse JSON files
    app.use(express.json());
    //Express middleware to serve files from a folder
    app.use(express.static(path.join(path.resolve(), 'public')));
    //Use the cookie parser middleware to get the cookies from the header
    app.use(cookieParser());

    //Endpoint to check if the API is currently working
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    });

    //Endpoint to access the API documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {swaggerOptions: { url: '/docs/openapi.json' }}))

    //Router for web views
    app.use('/' , createViewRouter())

    //Router for authentication
    app.use('/api/auth', createAuthRouter({ UserModel, TokenModel }))
    //Router for users
    app.use('/api/users', createUserRouter({}))
    //Router for games
    app.use('/api/games', createGameRouter({}))
    //Router for builds
    app.use('/api/builds', createBuildRouter({}))
    //Router for assets
    app.use('/api/assets', createAssetRouter({}))

    app.use(errorHandler);

    return app;
}