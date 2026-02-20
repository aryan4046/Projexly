const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

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
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if a user with this email already exists
                const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link google ID to existing account
                        user.googleId = profile.id;
                        user.isVerified = true; // Auto-verify if they connect google
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                const newUser = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: email || `${profile.id}@google.oauth`,
                    isVerified: true, // Google accounts are implicitly verified
                    role: "student", // default role, they can change later
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
            callbackURL: "/api/auth/github/callback",
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

                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link GitHub ID to existing account
                        user.githubId = profile.id;
                        user.isVerified = true;
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                const newUser = await User.create({
                    githubId: profile.id,
                    name: profile.displayName || profile.username,
                    email: email || `${profile.username}@github.oauth`,
                    isVerified: true,
                    role: "student",
                });

                return done(null, newUser);
            } catch (err) {
                return done(err, false);
            }
        }
    )
);

module.exports = passport;
