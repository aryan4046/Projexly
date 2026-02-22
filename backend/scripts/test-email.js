require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
    console.log("--- SMTP TEST START ---");
    console.log("User:", process.env.SMTP_USER);
    
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("✅ Connection Verified!");

        console.log("Sending test email...");
        const info = await transporter.sendMail({
            from: `"Projexly Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to self for testing
            subject: "Projexly SMTP Test",
            text: "If you are reading this, your SMTP configuration is working correctly!",
            html: "<b>If you are reading this, your SMTP configuration is working correctly!</b>"
        });

        console.log("✅ Email Sent successfully!");
        console.log("Response:", info.response);
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ SMTP ERROR Detail:");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
    }
    console.log("--- SMTP TEST END ---");
}

testEmail();
