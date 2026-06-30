import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';

const clientID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
const callbackURL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google account email not found'));
        }

        // 1. Check if user already exists with googleId
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          return done(null, user);
        }

        // 2. Check if user already exists with email
        user = await User.findOne({ email });
        if (user) {
          // Link Google ID to existing email account and mark verified
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();
          return done(null, user);
        }

        // 3. Otherwise, create a new user profile
        const baseUsername = (profile.displayName || email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        let username = baseUsername;
        let count = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${count}`;
          count++;
        }

        user = await User.create({
          name: profile.displayName || 'Google User',
          email,
          username,
          googleId: profile.id,
          isVerified: true, // Google accounts are implicitly verified
          preparationTypes: [],
        });

        return done(null, user);
      } catch (error: any) {
        return done(error);
      }
    },
  ),
);

// Boilerplate required by passport even if we are not using session-based authentication
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
