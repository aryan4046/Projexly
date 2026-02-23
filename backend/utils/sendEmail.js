const nodemailer = require("nodemailer");

/**
 * Robust email sending utility with detailed logging
 * @param {Object} options - {to, subject, text, html}
 */
let transporter;

/**
 * Initialize transporter once and reuse it
 */
const getTransporter = () => {
    if (!transporter) {
        console.log("[EMAIL] Initializing persistent transporter...");
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            },
            // Performance settings
            pool: true, 
            maxConnections: 5,
            maxMessages: 100
        });

        // Verify in background, don't block
        transporter.verify((error) => {
            if (error) console.error("[EMAIL] Persistent SMTP Verification Failed:", error.message);
            else console.log("[EMAIL] Persistent SMTP Connection Ready");
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    try {
        console.log(`[EMAIL] Sending to: ${options.to}`);
        
        const mailOptions = {
            from: `"Projexly" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const activeTransporter = getTransporter();
        const info = await activeTransporter.sendMail(mailOptions);
        
        console.log(`[EMAIL] SUCCESS: ${options.to} (Response: ${info.response})`);
        return info;
    } catch (error) {
        console.error(`[EMAIL] ERROR for ${options.to}: ${error.message}`);
        throw error;
    }
};

module.exports = sendEmail;
