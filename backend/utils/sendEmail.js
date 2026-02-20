const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // Create a reusable transporter object using default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: `"Projexly 🚀" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return info;
};

module.exports = sendEmail;
