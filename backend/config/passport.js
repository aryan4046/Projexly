const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// ------------------------------
// GOOGLE STRATEGY
// ------------------------------
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || "temp_google_id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "temp_google_secret",
            callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if a user with this email already exists
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
                const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link google ID to existing account
                        user.googleId = profile.id;
                        user.isVerified = user.isVerified || false; // Keep verified if already verified, else false or stay false
                        user.profilePicture = profilePicture; // Sync picture

                        if (!user.isVerified) {
                            const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            user.otp = await bcrypt.hash(rawOtp, 10);
                            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

                            try {
                                await sendEmail({
                                    to: user.email,
                                    subject: "Projexly - Verify your email",
                                    text: `Your OTP is ${rawOtp}.`,
                                    html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2>Verify your Google account on Projexly</h2><p>Your verification code is: <strong>${rawOtp}</strong></p></div>`
                                });
                            } catch (err) {
                                console.error("OAuth OTP Email Error (Google Existing):", err);
                            }
                        }

                        await user.save();
                        return done(null, user);
                    }
                }

                const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpHash = await bcrypt.hash(rawOtp, 10);

                // Create new user
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: email || `${profile.id}@google.oauth`,
                    isVerified: false,
                    role: "student",
                    profilePicture: profilePicture,
                    otp: otpHash,
                    otpExpires: new Date(Date.now() + 10 * 60 * 1000)
                });

                try {
                    await sendEmail({
                        to: newUser.email,
                        subject: "Projexly - Welcome! Verify your email",
                        text: `Your OTP is ${rawOtp}.`,
                        html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2>Welcome to Projexly!</h2><p>Please verify your Google account using this code: <strong>${rawOtp}</strong></p></div>`
                    });
                } catch (err) {
                    console.error("OAuth New User OTP Email Error (Google New):", err);
                }

                return done(null, newUser);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

// ------------------------------
// GITHUB STRATEGY
// ------------------------------
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || "temp_github_id",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "temp_github_secret",
            callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/github/callback`,
            scope: ["user:email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Fetch emails associated with GitHub
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
                const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : (profile._json ? profile._json.avatar_url : "");

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link GitHub ID to existing account
                        user.githubId = profile.id;
                        user.isVerified = user.isVerified || false;
                        user.profilePicture = profilePicture;

                        if (!user.isVerified) {
                            const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
                            user.otp = await bcrypt.hash(rawOtp, 10);
                            user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

                            try {
                                await sendEmail({
                                    to: user.email,
                                    subject: "Projexly - Verify your email",
                                    text: `Your OTP is ${rawOtp}.`,
                                    html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2>Verify your GitHub account on Projexly</h2><p>Your verification code is: <strong>${rawOtp}</strong></p></div>`
                                });
                            } catch (err) {
                                console.error("OAuth OTP Email Error (GitHub Existing):", err);
                            }
                        }

                        await user.save();
                        return done(null, user);
                    }
                }

                const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpHash = await bcrypt.hash(rawOtp, 10);

                // Create new user
                const newUser = await User.create({
                    githubId: profile.id,
                    name: profile.displayName || profile.username,
                    email: email || `${profile.username}@github.oauth`,
                    isVerified: false,
                    role: "student",
                    profilePicture: profilePicture,
                    otp: otpHash,
                    otpExpires: new Date(Date.now() + 10 * 60 * 1000)
                });

                try {
                    await sendEmail({
                        to: newUser.email,
                        subject: "Projexly - Welcome! Verify your email",
                        text: `Your OTP is ${rawOtp}.`,
                        html: `<div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 10px;"><h2>Welcome to Projexly!</h2><p>Please verify your GitHub account using this code: <strong>${rawOtp}</strong></p></div>`
                    });
                } catch (err) {
                    console.error("OAuth New User OTP Email Error (GitHub New):", err);
                }

                return done(null, newUser);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

module.exports = passport;
