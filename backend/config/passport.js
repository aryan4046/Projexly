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
                    if (!user.isVerified) {
                        user.isVerified = true;
                        await user.save();
                    }
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
                        user.isVerified = true; // Trust Google's verification
                        user.profilePicture = profilePicture;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user (instantly verified)
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: email || `${profile.id}@google.oauth`,
                    isVerified: true,
                    role: "student",
                    profilePicture: profilePicture,
                });

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
                    if (!user.isVerified) {
                        user.isVerified = true;
                        await user.save();
                    }
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
                        user.isVerified = true; // Trust GitHub's verification
                        user.profilePicture = profilePicture;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user (instantly verified)
                const newUser = await User.create({
                    githubId: profile.id,
                    name: profile.displayName || profile.username,
                    email: email || `${profile.username}@github.oauth`,
                    isVerified: true,
                    role: "student",
                    profilePicture: profilePicture,
                });

                return done(null, newUser);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

module.exports = passport;
