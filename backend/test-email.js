const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
    console.log("--- SMTP DIAGNOSTIC TEST ---");
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`Pass: ${process.env.SMTP_PASS ? "****" + process.env.SMTP_PASS.slice(-4) : "MISSING"}`);

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        console.log("Verifying connection...");
        await transporter.verify();
        console.log("✅ Connection Succeeded!");

        console.log("Sending test email...");
        const info = await transporter.sendMail({
            from: `"Projexly Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: "SMTP Connection Test",
            text: "If you are reading this, your SMTP configuration is working perfectly!",
        });

        console.log("✅ Email Sent successfully!");
        console.log(`Response: ${info.response}`);
    } catch (error) {
        console.error("❌ TEST FAILED");
        console.error(`Error Code: ${error.code}`);
        console.error(`Error Message: ${error.message}`);
    }
}

testEmail();
