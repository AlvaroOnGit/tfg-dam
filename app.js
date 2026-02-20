import path from 'node:path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { createViewRouter } from "./routes/web/view.routes.js";

export const createApp = () => {

    const app = express();

    //Deactivate express native header
    app.disable('x-powered-by');
    //Set ejs as the view engine for express
    app.set('view engine', 'ejs');
    //Express middleware to serve files from a folder
    app.use(express.static(path.join(path.resolve(), 'public')));

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

    //Endpoint for web views
    app.use('/' , createViewRouter())

    return app;
}