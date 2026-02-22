const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const sendEmail = require("./utils/sendEmail");

async function test() {
    console.log("Starting email test with new configuration (Explicit Host/Port)...");
    try {
        await sendEmail({
            to: process.env.SMTP_USER, // Send to self
            subject: "Projexly Test - Unified Logic",
            text: "This is a test email from the unified Projexly auth system.",
            html: "<h1>Test Successful</h1><p>Your SMTP configuration is working correctly with the unified logic.</p>"
        });
        console.log("Test email sent successfully!");
    } catch (err) {
        console.error("Test email failed:", err);
    }
}

test();
