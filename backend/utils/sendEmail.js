const { Resend } = require('resend');

/**
 * Robust email sending utility using Resend
 * @param {Object} options - {to, subject, text, html}
 */
let resend;

const sendEmail = async (options) => {
    try {
        // Lazy initialization to prevent crash if key is missing at startup
        if (!resend) {
            if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
                console.error("[EMAIL] CRITICAL: RESEND_API_KEY is missing or invalid in environment variables.");
                throw new Error("Missing RESEND_API_KEY. Please set it in your environment variables.");
            }
            resend = new Resend(process.env.RESEND_API_KEY);
        }

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
