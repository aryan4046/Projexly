const nodemailer = require("nodemailer");

/**
 * Robust email sending utility with detailed logging
 * @param {Object} options - {to, subject, text, html}
 */
let transporter;

const sendEmail = async (options) => {
    try {
        console.log(`[EMAIL] Attempting to send email to: ${options.to}`);

        // Lazy initialization
        if (!transporter) {
            console.log("[EMAIL] Initializing new transporter...");
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verification
            try {
                await transporter.verify();
                console.log("[EMAIL] SMTP connection verified successfully");
            } catch (verifyErr) {
                console.error("[EMAIL] SMTP Verification Failed:", verifyErr.message);
                transporter = null;
                throw verifyErr;
            }
        }

        // Define email options
        const mailOptions = {
            from: `"Projexly" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Success: Email sent to ${options.to}`);

        return info;
    } catch (error) {
        console.error(`[EMAIL] ERROR: Failed to send email to ${options.to}`);
        console.error(`[EMAIL] Error Message: ${error.message}`);
        throw error;
    }
};

module.exports = sendEmail;
