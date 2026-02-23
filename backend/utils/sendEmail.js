const sgMail = require("@sendgrid/mail");

/**
 * Robust SendGrid email utility
 */
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn("[EMAIL] WARNING: SENDGRID_API_KEY is not defined in environment variables.");
}

/**
 * Generate a 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP using SendGrid with the requested styled template
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP
 */
const sendOTPEmail = async (toEmail, otp) => {
    const msg = {
        to: toEmail,
        from: {
            email: "info.projexly@gmail.com",
            name: "Projexly"
        },
        subject: "Verify your email",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Email Verification</h2>
                <p style="text-align: center; color: #64748b; font-size: 16px;">Your OTP is:</p>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #cbd5e1;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
                </div>
                <p style="text-align: center; color: #94a3b8; font-size: 14px;">This OTP expires in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
                <p style="text-align: center; color: #94a3b8; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    try {
        console.log(`[SENDGRID] Sending OTP to: ${toEmail}`);
        await sgMail.send(msg);
        console.log(`[SENDGRID] OTP SUCCESS: ${toEmail}`);
    } catch (error) {
        console.error(`[SENDGRID] OTP ERROR for ${toEmail}: ${error.message}`);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};

/**
 * Generic email sending utility using SendGrid
 * Maintained for backward compatibility with existing codebase
 * @param {Object} options - {to, subject, text, html}
 */
const sendEmail = async (options) => {
    try {
        console.log(`[SENDGRID] Sending to: ${options.to}`);
        
        const msg = {
            to: options.to,
            from: {
                email: "info.projexly@gmail.com",
                name: "Projexly"
            },
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await sgMail.send(msg);
        console.log(`[SENDGRID] SUCCESS: ${options.to}`);
        return info;
    } catch (error) {
        console.error(`[SENDGRID] ERROR for ${options.to}: ${error.message}`);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.generateOTP = generateOTP;
module.exports.sendOTPEmail = sendOTPEmail;
