import express from 'express';

export const createApp = () => {

    const app = express();

    //Deactivate express native header
    app.disable('x-powered-by');

    //Simple endpoint to check if the API is currently working
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'OK',
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    });

    return app;
}