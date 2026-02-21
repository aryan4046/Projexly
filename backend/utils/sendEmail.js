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
        from: `"Projexly 🚀" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    // Send the email
    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
