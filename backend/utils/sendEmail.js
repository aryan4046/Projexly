const nodemailer = require("nodemailer");

// Create a reusable transporter object once
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (options) => {
    // Define email options
    const mailOptions = {
        from: `"Projexly" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    let lastError;
    // Retry logic (3 attempts)
    for (let i = 0; i < 3; i++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully on attempt ${i + 1}!`);
            console.log("Accepted:", info.accepted);
            console.log("Response:", info.response);
            return info;
        } catch (error) {
            lastError = error;
            console.error(`Email attempt ${i + 1} failed:`, error.message);
            // Wait 1 second before retrying
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.error("All email attempts failed.");
    throw lastError;
};

module.exports = sendEmail;
