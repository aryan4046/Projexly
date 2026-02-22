const nodemailer = require("nodemailer");

/**
 * Robust email sending utility with detailed logging
 * @param {Object} options - {to, subject, text, html}
 */
const sendEmail = async (options) => {
    try {
        console.log(`[EMAIL] Attempting to send to: ${options.to}`);
        console.log(`[EMAIL] Using account: ${process.env.SMTP_USER}`);

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error("SMTP credentials missing from environment variables");
        }

        // Fresh transporter for every request during debugging
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // Using 465/secure for Gmail is often more stable
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verification
        await transporter.verify();
        console.log("[EMAIL] SMTP Connection Verified");

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
        console.log(`[EMAIL] SUCCESS: Message sent to ${options.to}`);
        console.log(`[EMAIL] Response: ${info.response}`);

        return info;
    } catch (error) {
        console.error(`[EMAIL] ERROR for ${options.to}: ${error.message}`);
        throw error;
    }
};

module.exports = sendEmail;
