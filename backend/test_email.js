require('dotenv').config();
const nodemailer = require('nodemailer');

const test = async () => {
    console.log("--- Starting SMTP Diagnostic ---");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    // Do not log password for security, but check if it's there
    console.log("SMTP_PASS length:", process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true, // Enable debug output
        logger: true  // Enable built-in logger
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER, // Send to self for testing
        subject: "Projexly - Diagnostic Test",
        text: "This is a diagnostic test to verify SMTP functionality.",
        html: "<b>This is a diagnostic test to verify SMTP functionality.</b>",
    };

    try {
        console.log("\nAttempting to send test email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("\n✅ Success!");
        console.log("Message ID:", info.messageId);
        console.log("Accepted:", info.accepted);
        console.log("Response:", info.response);
    } catch (error) {
        console.error("\n❌ FAILED!");
        console.error("Error Code:", error.code);
        console.error("Error Command:", error.command);
        console.error("Error Response:", error.response);
        console.error("Full Error:", error);
    }
};

test();
