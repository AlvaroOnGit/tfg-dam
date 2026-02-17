import path from 'node:path';
import express from 'express';
import { createViewRouter } from "./routes/web/view.routes.js";

export const createApp = () => {

    const app = express();

    //Deactivate express native header
    app.disable('x-powered-by');
    //Set ejs as the view engine for express
    app.set('view engine', 'ejs');
    //Express middleware to serve files from a folder
    app.use(express.static(path.join(path.resolve(), 'public')));

    //Simple endpoint to check if the API is currently working
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    });

    app.use('/' , createViewRouter())

    return app;
}