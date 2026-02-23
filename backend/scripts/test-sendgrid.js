require("dotenv").config();
const { sendEmail, generateOTP, sendOTPEmail } = require("../utils/sendEmail");

async function testSendGrid() {
    console.log("--- SENDGRID SYSTEM TEST START ---");
    
    if (!process.env.SENDGRID_API_KEY) {
        console.error("❌ ERROR: SENDGRID_API_KEY is missing in .env");
        process.exit(1);
    }

    console.log("Configuration detected. Attempting to send test emails...");

    try {
        // Test 1: Generic sendEmail
        console.log("\n[Test 1] Testing generic sendEmail...");
        await sendEmail({
            to: "info.projexly@gmail.com", // Sending to self or change to user email
            subject: "Projexly - SendGrid Generic Test",
            text: "This is a generic test email from SendGrid.",
            html: "<strong>This is a generic test email from SendGrid.</strong>"
        });
        console.log("✅ Generic sendEmail test finished.");

        // Test 2: generateOTP & sendOTPEmail
        console.log("\n[Test 2] Testing OTP generation and styled email...");
        const otp = generateOTP();
        console.log(`Generated OTP: ${otp}`);
        
        await sendOTPEmail("info.projexly@gmail.com", otp);
        console.log("✅ Styled OTP email test finished.");

        console.log("\n--- SENDGRID SYSTEM TEST COMPLETED SUCCESSFULLY ---");
    } catch (error) {
        console.error("\n❌ SENDGRID TEST FAILED");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("SendGrid Response Error:", JSON.stringify(error.response.body, null, 2));
        }
    }
}

testSendGrid();
