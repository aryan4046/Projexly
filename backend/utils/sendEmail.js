const { Resend } = require('resend');

/**
 * Robust email sending utility using Resend
 * @param {Object} options - {to, subject, text, html}
 */
let resend;

const sendEmail = async (options) => {
    // 1. Check for Development Mode
    if (process.env.EMAIL_DEV_MODE === 'true') {
        console.log("========================================");
        console.log("[EMAIL DEV MODE] Simulation");
        console.log(`TO: ${options.to}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`TEXT: ${options.text}`);
        console.log("========================================");
        return { id: "dev-mode-simulated", data: "simulated" };
    }

    try {
        // Lazy initialization to prevent crash if key is missing at startup
        if (!resend) {
            if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
                console.warn("[EMAIL] RESEND_API_KEY is missing. Falling back to console log.");
                return simulateEmail(options);
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
            
            if (result.error.message.includes("testing emails to your own email address")) {
                console.error("[EMAIL] HELP: You are in Resend Sandbox Mode. Verifying domain is required to send to others.");
                console.log("[EMAIL] FALLBACK: Logging content to console instead of failing.");
                return simulateEmail(options);
            }

            throw new Error(result.error.message);
        }

        console.log(`[EMAIL] Success: Email sent to ${options.to} (ID: ${result.data.id})`);
        return result.data;
    } catch (error) {
        console.error(`[EMAIL] ERROR: Failed to send email to ${options.to}`);
        console.error(`[EMAIL] Error Message: ${error.message}`);

        // Final fallback to console log so the user registration/login flow isn't broken
        return simulateEmail(options);
    }
};

/**
 * Helper to log email to console when delivery fails or is disabled
 */
const simulateEmail = (options) => {
    console.log("----------------------------------------");
    console.log("[EMAIL SIMULATION]");
    console.log(`TO: ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY: ${options.text || "HTML content hidden"}`);
    console.log("----------------------------------------");
    return { id: "simulated-" + Date.now(), simulated: true };
};

module.exports = sendEmail;
