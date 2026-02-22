const nodemailer = require("nodemailer");

/**
 * Robust email sending utility with detailed logging
 * @param {Object} options - {to, subject, text, html}
 */
// Reusable transporter object
let transporter;

/**
 * Robust email sending utility with detailed logging
 * @param {Object} options - {to, subject, text, html}
 */
const sendEmail = async (options) => {
    try {
        console.log(`[EMAIL] Attempting to send email to: ${options.to}`);

        // Lazy initialization
        if (!transporter) {
            transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    rejectUnauthorized: false // Helps in some restricted environments
                },
                connectionTimeout: 10000, // 10s
                greetingTimeout: 10000,
            });

            // Verify connection configuration
            try {
                await transporter.verify();
                console.log("[EMAIL] SMTP connection verified successfully");
            } catch (verifyErr) {
                console.error("[EMAIL] SMTP Verification Failed:", verifyErr.message);
                transporter = null; // Reset so it retries next time
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
        console.log(`[EMAIL] Response: ${info.response}`);

        return info;
    } catch (error) {
        console.error(`[EMAIL] ERROR: Failed to send email to ${options.to}`);
        console.error(`[EMAIL] Error Code: ${error.code}`);
        console.error(`[EMAIL] Error Message: ${error.message}`);

        if (error.message.includes("Invalid login")) {
            console.error("[EMAIL] TIP: Check if your SMTP_PASS (App Password) is correct.");
        }

        // Throw error so caller knows it failed
        throw error;
    }
};


module.exports = sendEmail;
