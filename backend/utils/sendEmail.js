const { Resend } = require('resend');

/**
 * Robust email sending utility using Resend
 * @param {Object} options - {to, subject, text, html}
 */
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        console.log(`[EMAIL] Attempting to send email to: ${options.to}`);

        const result = await resend.emails.send({
            from: 'Projexly <onboarding@resend.dev>', // Update this after verifying domain
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });

        if (result.error) {
            console.error(`[EMAIL] Resend Error:`, result.error);
            throw new Error(result.error.message);
        }

        console.log(`[EMAIL] Success: Email sent to ${options.to} (ID: ${result.data.id})`);
        return result.data;
    } catch (error) {
        console.error(`[EMAIL] ERROR: Failed to send email to ${options.to}`);
        console.error(`[EMAIL] Error Message: ${error.message}`);

        if (error.message.includes("API key")) {
            console.error("[EMAIL] TIP: Check if your RESEND_API_KEY is correct in .env");
        }

        throw error;
    }
};

module.exports = sendEmail;
