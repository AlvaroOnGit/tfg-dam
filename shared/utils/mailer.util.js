/**
 * Shared utility to send emails
 */

import path from 'node:path';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { InternalError } from "../middlewares/error.middleware.js";

/**
 * Nodemailer transporter configured with Gmail SMTP.
 * Requires MAILER_ADDRESS and MAILER_PASSWORD environment variables.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAILER_ADDRESS,
        pass: process.env.MAILER_PASSWORD,
    },
});


export class MailerUtil {

    static templateDir = path.join(process.cwd(), 'templates', 'emails');
    static templates = {
        resetPasswordTemplate: path.join(this.templateDir, 'reset-password.ejs'),
    }

    /**
     * Sends a password reset email to the specified recipient.
     * @param {string} recipient - The recipient's email address.
     * @param {string} url - The password reset URL to include in the email.
     * @param {string} username - The recipient's username to personalize the email.
     * @returns {Promise<void>}
     * @throws {InternalError} If the mail server authentication fails (EAUTH).
     * @throws {InternalError} If the connection to the mail server fails (ECONNECTION).
     * @throws {InternalError} If the email could not be sent for any other reason.
     */
    static async sendResetMail(recipient, url, username) {

        const html = await ejs.renderFile(this.templates.resetPasswordTemplate, {
            username,
            url,
            year: new Date().getFullYear(),
        });

        try {
            await transporter.sendMail({
                from: process.env.MAILER_ADDRESS,
                to: recipient,
                subject: 'TFG DAM — password reset',
                html,
            });
        } catch (e) {
            if (e.code === 'EAUTH') {
                throw new InternalError('Mail server authentication failed', e);
            }
            if (e.code === 'ECONNECTION') {
                throw new InternalError('Mail server connection failed', e);
            }
            throw new InternalError('Error sending reset mail', e);
        }
    }
}